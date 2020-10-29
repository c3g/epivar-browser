/*
 * db-ihec.js
 */


const mysql   = require('mysql')

const config = require('../../config')

const pool = mysql.createPool({
  host:            config.source.ihec.mysql.host,
  user:            config.source.ihec.mysql.user,
  password:        config.source.ihec.mysql.password,
  database:        config.source.ihec.mysql.database,
  connectionLimit: 10,
})

module.exports = {
  getTracks,
}

function getTracks(samples, assay) {

  const sampleNames = Object.keys(samples)

  const q =
    `
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
        WHERE donor IN (${sampleNames.map(mysql.escape).join(', ')})
              AND track_type = 'bigWig'
              AND assembly.name = 'hg19'
      ${ typeof assay === 'string' ?
              `AND assay.name = ${mysql.escape(assay)}` : ''
      }
    `

  return query(q)
  .then(tracks => {
    tracks.forEach(track => {
      track.path = getLocalPath(track)
      Object.assign(track, info.samples[track.donor])
    })
    return tracks
  })
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



// Helpers

function format(q, values = {}) {
  if (!values)
    return q

  return q.replace(/@(\w+)/g, (txt, key) => {
    if (key in values)
      return mysql.escape(values[key])
    return txt;
  })
}

function query(q, values) {
  return new Promise((resolve, reject) => {
    pool.query(format(q, values), (error, results, fields) => {
      if (error)
        reject(error)
      else
        resolve(results, fields)
    })
  })
}

function queryOne(q, values) {
  return query(q, values).then(results => results[0])
}

function insert(q, values) {
  return query(q, values).then(results => results.insertId)
}

function get() {
  return pool
}

