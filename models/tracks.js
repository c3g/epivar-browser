/*
 * tracks.js
 */

const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const exists = promisify(fs.exists)
const md5 = require('md5')
const { prop, groupBy } = require('rambda')

const bigWigMerge = require('../helpers/bigwig-merge.js')
const bigWigInfo = require('../helpers/bigwig-info.js')
const valueAt = require('../helpers/value-at.js')
const config = require('../config.js')
const Samples = require('./samples.js')

const source = require('./source')

module.exports = {
  get,
  values,
  group,
  clean,
  merge,
  calculate,
}

const range = { start: 0, end: 1000 }

function get(chrom, position, assay = undefined) {
  return Samples.queryMap(chrom, position).then(info => {
    return source.getTracks(info.samples, assay)
  })
}

function values(chrom, position, start, end) {
  return get(chrom, position)
  .then(filterTracksUniqueDonorAssay)
  .then(tracks =>
    Promise.all(tracks.map(track =>
      valueAt(track.path, { chrom, start, end, ...config.merge })
      .then(value => (value === undefined ? undefined : {
        id: track.id,
        donor: track.donor,
        assay: track.assay,
        variant: track.variant,
        type: track.type,
        value: track.value,
        data: value,
        track: track,
      }))
    ))
    .then(values => values.filter(v => v !== undefined))
  )
}

function group(tracks) {
  const tracksByAssay = {}
  Object.entries(groupBy(prop('assay'), tracks)).forEach(([assay, tracks]) => {
    Object.entries(groupBy(x => x.track.condition, tracks)).forEach(([condition, tracks]) => {
      if (!tracksByAssay[assay])
        tracksByAssay[assay] = {}
      tracksByAssay[assay][condition] = groupBy(prop('type'), tracks)
    })
  })
  return tracksByAssay
}

function clean(/* mut */ tracksByAssay) {
  Object.keys(tracksByAssay).forEach(assay => {
    const tracksByEthnicity = tracksByAssay[assay]
    if (Object.values(tracksByEthnicity).every(ts => ts.HET === undefined && ts.HOM === undefined)) {
      delete tracksByAssay[assay]
    }
  })
  return tracksByAssay
}

function calculate(tracksByAssay) {
  Object.keys(tracksByAssay).forEach(assay => {
    Object.keys(tracksByAssay[assay]).forEach(condition => {
      const tracksByType = tracksByAssay[assay][condition]
      tracksByType.HET = derive(tracksByType.HET || [])
      tracksByType.HOM = derive(tracksByType.HOM || [])
      tracksByType.REF = derive(tracksByType.REF || [])
    })
  })

  return tracksByAssay
}

function merge(tracks, { chrom, start, end }) {

  const tracksByAssay = clean(group(tracks))

  const mergeTracksByType = tracksByType =>
    Promise.all(
      [
        tracksByType.REF || [],
        tracksByType.HET || [],
        tracksByType.HOM || []
      ].map(tracks =>
        tracks.length > 0 ?
          mergeFiles(tracks.map(prop('path')), { chrom, start, end }) :
          undefined
      )
    )

  let promisedTracks

  promisedTracks = 
    Object.entries(tracksByAssay).map(([assay, tracksByEthnicity]) => {
      return Object.entries(tracksByEthnicity).map(([condition, tracksByType]) => {
        return mergeTracksByType(tracksByType)
        .then(output => {
          return {
            assay,
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
      .flat()
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
  const deviationPath = mergePath.replace(/\.bw$/, '-dev.bw')

  return exists(mergePath)
    .then(yes => yes ?
      true :
      bigWigMerge(paths, {
        output: mergePath,
        deviation: paths.length > 1 ? deviationPath : undefined,
        chrom,
        start,
        end,
        ...config.merge
      })
    )
    .then(() => ({ path: mergePath, url, hasDeviation: paths.length > 1 }))
}

function filterTracksUniqueDonorAssay(tracks) {
  const combinations = new Map()
  const filteredTracks = tracks.filter(track => {
    const key = `${track.donor}-${track.assay}`
    if (combinations.has(key)) {
      return false
    }
    combinations.set(key, track)
    return true
  })
  return filteredTracks
}

function derive(list) {
  const n = list.length
  const points = list.map(d => d.data).sort((a, b) => a - b)

  const data = {
    n: n,
    min: Math.min(...points),
    max: Math.max(...points),
    stats: getStats(points),
    points,
  }

  return data
}

function getStats(points) {
  return {
    start:  points[~~(points.length * 1/4)],
    median: points[~~(points.length * 2/4)],
    end:    points[~~(points.length * 3/4)],
  }
}
