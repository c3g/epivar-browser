/*
 * tracks.js
 */

const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const exists = promisify(fs.exists)
const md5 = require('md5')
const { prop, groupBy } = require('ramda')

const sliceAndMerge = require('../helpers/slice-and-merge.js')
const db = require('../db-ihec.js')
const config = require('../config.js')

module.exports = {
  get,
  merge,
}

function get(donors) {

  const query = `
    SELECT *
         , assembly.name AS assembly
         , assay.name AS assay
     FROM dataset_track AS track
     JOIN dataset      ON dataset.id      = track.dataset_id
     JOIN assay        ON assay.id        = dataset.assay_id
     JOIN data_release ON data_release.id = dataset.data_release_id
     JOIN assembly     ON assembly.id     = data_release.assembly_id
     JOIN institution  ON institution.id  = data_release.provider_institution_id
    WHERE donor IN (${donors.map(db.escape).join(', ')})
          AND track_type = 'bigWig'
  `

  return db.query(query).then(tracks => {
    tracks.forEach(track => track.path = getLocalPath(track))
    return tracks
  })
}

function merge(tracks) {

  const tracksByAssay = groupBy(prop('assay'), tracks)

  return Promise.all(Object.entries(tracksByAssay).map(([assay, tracks]) => {
    const paths = tracks.map(prop('path')).sort(Intl.Collator().compare)
    const mergeHash = md5(JSON.stringify(paths))
    const mergeName = mergeHash + '.bw'
    const url = `/merged/${mergeName}`
    const mergePath = path.join(config.paths.mergedTracks, mergeName)

    return exists(mergePath)
      .then(yes => yes ? true : sliceAndMerge(paths, { output: mergePath, ...config.merge }))
      .then(() => ({ assay, tracks, path: mergePath, url }))
  }))
}


function getLocalPath(track) {
  return path.join(
    config.paths.tracks,
    track.short_name.toLowerCase(),
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
