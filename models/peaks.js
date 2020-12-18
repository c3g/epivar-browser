/*
 * peaks.js
 */


const Database = require('sqlite-objects').Database
const parseFeature = require('../helpers/parse-feature')
const config = require('../config')

const database = new Database(config.paths.peaks)

module.exports = {
  query,
  chroms,
  positions,
}

function query(chrom, position) {
  return database.findAll(
    `
     SELECT *
       FROM peaks
      WHERE chrom = @chrom
        AND position = @position
    `,
    { chrom, position }
  )
  .then(peaks => peaks.map(p => {
    p.feature = parseFeature(p.feature)
    return p
  }))
}

let cachedChroms = config.development.chroms || undefined
function chroms() {
  if (cachedChroms)
    return Promise.resolve(cachedChroms)

  return database.findAll(
    `
     SELECT DISTINCT(chrom)
       FROM peaks
    `
  )
  .then(rows => rows.map(r => r.chrom))
}

function positions(chrom, position) {
  return database.findAll(
    `
     SELECT DISTINCT(position)
       FROM peaks
      WHERE chrom = @chrom
        AND position LIKE @query
    `,
    { chrom, query: String(position) + '%' }
  )
  .then(rows => rows.map(r => r.position))
}
