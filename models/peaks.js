/*
 * peaks.js
 */


const Database = require('sqlite-objects').Database
const parseFeature = require('../helpers/parse-feature')
const config = require('../config')

const database = new Database(config.paths.peaks)

module.exports = {
  query,
  queryByRsID,
  chroms,
  rsIDs,
  rsIDsWithDetail,
  positions,
  positionsWithDetail,
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
  .then(normalizePeaks)
}

function queryByRsID(rsID) {
  return database.findAll(
    `
     SELECT *
       FROM peaks
      WHERE rsID = @rsID
    `,
    { rsID }
  )
  .then(normalizePeaks)
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

let cachedRsIDs = config.development.rsIDs || undefined
function rsIDs(query) {
  if (cachedRsIDs)
    return Promise.resolve(cachedRsIDs)

  return database.findAll(
    `
     SELECT DISTINCT(rsID)
       FROM peaks
      WHERE rsID LIKE @query
      LIMIT 200
    `,
    { query: String(query) + '%' }
  )
  .then(rows => rows.map(r => r.rsID))
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

function rsIDsWithDetail(query) {
  return database.findAll(
    `
      SELECT rsID, AVG(valueNI) AS avgValueNI, AVG(valueFlu) AS avgValueFlu, COUNT(*) AS nPeaks
        FROM peaks
       WHERE rsID LIKE @query
    GROUP BY rsID
    ORDER BY avgValueNI
       LIMIT 100
    `,
    { query: String(query) + '%' }
  )
}

function positionsWithDetail(chrom, position) {
  return database.findAll(
    `
      SELECT position, AVG(valueNI) AS avgValueNI, AVG(valueFlu) AS avgValueFlu, COUNT(*) AS nPeaks
        FROM peaks
       WHERE chrom = @query 
         AND position LIKE @query
    GROUP BY position
    ORDER BY avgValueNI
       LIMIT 100
    `,
    { chrom, query: String(position) + '%' }
  )
}


// Helpers

function normalizePeaks(peaks) {
  return peaks.map(p => {
    p.feature = parseFeature(p.feature)
    return p
  })
}
