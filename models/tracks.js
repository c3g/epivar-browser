/*
 * tracks.js
 */

const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const exists = promisify(fs.exists)
const md5 = require('md5')
const Cache = require('map-expire')
const { map, path: prop, groupBy } = require('rambda')

const bigWigMerge = require('../helpers/bigwig-merge')
const bigWigChromosomeLength = require('../helpers/bigwig-chromosome-length')
const valueAt = require('../helpers/value-at')
const config = require('../config')
const Samples = require('./samples')

const source = require('./source')

module.exports = {
  get,
  values,
  group,
  merge,
  calculate,
}

const groupByEthnicity = groupBy(prop('ethnicity'))
const mapToData = map(prop('data'))

function get(peak) {
  const chrom    = peak.chrom
  const position = peak.position - 1 // FIXME remove position - 1 hack (needs clean data)

  return Samples.queryMap(chrom, position).then(info => {
    return source.getTracks(info.samples, peak)
  })
}

const valuesCache = new Cache()
function values(peak) {
  if (valuesCache.has(peak.id)) {
    return Promise.resolve(valuesCache.get(peak.id))
  }

  return get(peak)
  .then(tracks =>
    Promise.all(tracks.map(track =>
      valueAt(track.path, {
        chrom: peak.feature.chrom,
        start: peak.feature.start,
        end:   peak.feature.end,
        ...config.merge
      })
      .then(value => (value === undefined ? undefined : {
        id: track.id,
        donor: track.donor,
        assay: track.assay,
        condition: track.condition,
        ethnicity: track.ethnicity,
        variant: track.variant,
        type: track.type,
        value: track.value,
        data: value,
      }))
    ))
    .then(values => values.filter(v => v !== undefined))
  )
  .then(result => {
    valuesCache.set(peak.id, result, 60 * 60 * 1000)
    return result
  })
}

function group(tracks) {
  const tracksByCondition = {}
  Object.entries(groupBy(x => x.condition, tracks)).forEach(([condition, tracks]) => {
    tracksByCondition[condition] = groupBy(prop('type'), tracks)
  })
  return tracksByCondition
}

function calculate(tracksByCondition) {
  Object.keys(tracksByCondition).forEach(condition => {
    const tracksByType = tracksByCondition[condition]
    tracksByType.HET = derive(tracksByType.HET || [])
    tracksByType.HOM = derive(tracksByType.HOM || [])
    tracksByType.REF = derive(tracksByType.REF || [])
  })

  return tracksByCondition
}

function merge(tracks, session) {

  const tracksByCondition = group(tracks)

  const mergeTracksByType = tracksByType =>
    Promise.all(
      [
        tracksByType.REF || [],
        tracksByType.HET || [],
        tracksByType.HOM || []
      ].map(async tracks => {
        if (tracks.length === 0)
          return undefined

        const filepaths = tracks.map(prop('path'))

        const maxSize = await bigWigChromosomeLength(filepaths[0], session.peak.feature.chrom)

        return mergeFiles(filepaths, {
          chrom: session.peak.feature.chrom,
          start: Math.max(session.peak.feature.start - 100000, 0),
          end:   Math.min(session.peak.feature.end + 100000, maxSize),
        })
      })
    )

  let promisedTracks

  promisedTracks = 
    Object.entries(tracksByCondition).map(([condition, tracksByType]) => {
      return mergeTracksByType(tracksByType)
      .then(output => {
        return {
          assay: session.peak.assay,
          condition,
          tracks,
          output: {
            REF: output[0],
            HET: output[1],
            HOM: output[2],
          }
        }
      })
    })

  return Promise.all(promisedTracks)
    .then(results => results.filter(Boolean))
}


// Helpers

function mergeFiles(paths, { chrom, start, end }) {
  paths.sort(Intl.Collator().compare)
  const mergeHash = md5(JSON.stringify({ paths, chrom, start, end }))
  const mergeName = mergeHash + '.bw'
  const url = `/merged/${mergeName}`
  const mergePath = path.join(config.paths.mergedTracks, mergeName)

  return exists(mergePath)
    .then(yes => yes ?
      true :
      bigWigMerge(paths, {
        output: mergePath,
        chrom,
        start,
        end,
        ...config.merge
      })
    )
    .then(() => ({ path: mergePath, url }))
}

function derive(list) {
  const points = list.map(d => d.data).sort((a, b) => a - b)
  const pointsByEthnicity = map(mapToData, groupByEthnicity(list))

  return {
    n: list.length,
    min: Math.min(...points),
    max: Math.max(...points),
    stats: getStats(points),
    points: pointsByEthnicity,
  }
}

function getStats(points) {
  return {
    start:  points[~~(points.length * 1/4)],
    median: points[~~(points.length * 2/4)],
    end:    points[~~(points.length * 3/4)],
  }
}
