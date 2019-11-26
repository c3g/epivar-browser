/*
 * tracks.js
 */

const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const exists = promisify(fs.exists)
const md5 = require('md5')
const { prop, groupBy } = require('ramda')

const bigWigMerge = require('../helpers/bigwig-merge.js')
const bigWigInfo = require('../helpers/bigwig-info.js')
const valueAt = require('../helpers/value-at.js')
const dbIHEC = require('../db-ihec.js')
const config = require('../config.js')
const Samples = require('./samples.js')

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

  const makeQuery = samples => `
      SELECT track.id
           , institution.short_name
           , sample_name
           , donor
           , track.view
           , track.track_type
           , track.id as id
           , assembly.name as assembly
           , assay.name as assay
           , assay.id as assay_id
           , assay_category.name as assay_category
           , assay_category.id as assay_category_id
        FROM dataset_track as track
        JOIN dataset on dataset.id = track.dataset_id
        JOIN assay on assay.id = dataset.assay_id
        JOIN assay_category on assay_category.id = assay.assay_category_id
        JOIN data_release on data_release.id = dataset.data_release_id
        JOIN assembly on assembly.id = data_release.assembly_id
        JOIN institution on institution.id = data_release.provider_institution_id
       WHERE donor IN (${samples.map(dbIHEC.escape).join(', ')})
              AND track_type = 'bigWig'
              AND assembly.name = 'hg19'
      ${ typeof assay === 'string' ?
             `AND assay.name = ${dbIHEC.escape(assay)}` : ''
      }
    `

  return Samples.queryMap(chrom, position).then(info => {
    return dbIHEC.query(makeQuery(Object.keys(info.samples)))
    .then(tracks => {
      tracks.forEach(track => {
        track.path = getLocalPath(track)
        Object.assign(track, info.samples[track.donor])
      })
      return tracks
    })
  })
}

function values(chrom, position, start, end) {
  return get(chrom, position)
  .then(filterTracksUniqueDonorAssay)
  .then(tracks =>
    Promise.all(tracks.map(track =>

      Promise.all([
        bigWigInfo(track.path, config.merge),
        valueAt(track.path, { chrom, start, end, ...config.merge }),
      ])
      .then(([summary, value]) => (value === undefined ? undefined : {
        id: track.id,
        donor: track.donor,
        assay: track.assay,
        variant: track.variant,
        type: track.type,
        value: track.value,
        data: ((((value - summary.min) / (summary.max - summary.min)) * (range.end - range.start)) + range.start),
        originalData: value,
      }))
    ))
    .then(values => values.filter(v => v !== undefined))
  )
}

function group(tracks) {
  const tracksByAssay = {}
  Object.entries(groupBy(prop('assay'), tracks)).forEach(([assay, tracks]) => {
    tracksByAssay[assay] = groupBy(prop('type'), tracks)
  })
  return tracksByAssay
}

function clean(/* mut */ tracksByAssay) {
  Object.keys(tracksByAssay).forEach(assay => {
    const tracksByType = tracksByAssay[assay]
    if (tracksByType.HET === undefined && tracksByType.HOM === undefined)
      delete tracksByAssay[assay]
  })
  return tracksByAssay
}

function calculate(tracksByAssay) {
  Object.keys(tracksByAssay).forEach(assay => {
    const tracksByType = tracksByAssay[assay]

    if (tracksByType.HET === undefined && tracksByType.HOM === undefined) {
      delete tracksByAssay[assay]
      return
    }

    tracksByType.HET = derive(tracksByType.HET || [])
    tracksByType.HOM = derive(tracksByType.HOM || [])
    tracksByType.REF = derive(tracksByType.REF || [])
  })

  return tracksByAssay
}

function merge(tracks, { chrom, start, end }) {

  const tracksByAssay = clean(group(tracks))

  return Promise.all(Object.entries(tracksByAssay).map(([assay, tracksByType]) => {

    if (tracksByType.HET === undefined && tracksByType.HOM === undefined)
      return undefined

    return Promise.all(
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
    .then(output => {
      return {
        assay,
        tracks,
        output: {
          REF: output[0],
          HET: output[1],
          HOM: output[2],
        }
      }
    })
  }))
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

function getLocalPath(track) {
  return path.join(
    config.paths.tracks,
    track.short_name,
    track.assembly,
    [
      track.id,
      track.short_name,
      track.sample_name,
      track.assay,
      track.view,
      track.track_type
    ].join('.')
  )
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
  const hidden = n <= 3
  const dataPoints = hidden ? null : list.map(d => d.data).sort((a, b) => a - b)

  const data = {
    n: n,
    hidden: hidden,
    min: hidden ? null : Math.min(...dataPoints),
    max: hidden ? null : Math.max(...dataPoints),
    stats: hidden ? null : getStats(dataPoints),
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
