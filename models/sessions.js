/*
 * sessions.js
 */

const path = require('path')
const md5 = require('md5')
const Database = require('sqlite-objects').Database

const Tracks = require('./tracks')
const config = require('../config')

const database = new Database(
  config.paths.sessions,
  path.join(__dirname, 'sessions.sql')
)

module.exports = {
  create,
  get,
}

async function create(peak) {

  const tracksByCondition =
    await Tracks.values(peak).then(Tracks.group)

  const samples =
    Object.values(tracksByCondition).flat().map(d => d.donor)
  samples.sort(Intl.Collator().compare)

  const session = { samples, peak }
  const text = JSON.stringify(session)
  const hash = md5(text)

  return get(hash).then(row => {
    if (row)
      return hash

    return database.insert(
      `INSERT INTO sessions
                   (hash, samples, peak)
            VALUES (@hash, @samples, @peak)`,
      {
        hash,
        samples: JSON.stringify(samples),
        peak: JSON.stringify(peak),
      }
    )
    .then(() => hash)
  })
}

function get(hash) {
  return database.findOne(`SELECT * FROM sessions WHERE hash = @hash`, { hash })
  .then(row => {
    if (!row)
      return undefined
    row.samples = JSON.parse(row.samples)
    row.peak = JSON.parse(row.peak)
    return row
  })
}
