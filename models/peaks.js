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
  queryByGene,
  chroms,
  assays,
  rsIDs,
  positions,
  autocompleteWithDetail,
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

function queryByGene(gene) {
  return database.findAll(
    `
     SELECT *
       FROM peaks
      WHERE gene = @gene
    `,
    { gene }
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

function assays() {
  return database.findAll(
    `
    SELECT DISTINCT(assay)
      FROM peaks
    `
  ).then(rows => rows.map(r => r.assay))
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

function autocompleteWithDetail(query) {
  const {rsID, gene, chrom, position} = query;

  const {select, where, params, by} = (() => {
    if (rsID) {
      return {
        select: "rsID",
        where: "g.rsID LIKE @query",
        params: {query: String(rsID) + '%'},
        by: "rsID",
      }
    } else if (gene) {
      return {
        select: "gene",
        where: "g.gene LIKE @query",
        params: {query: String(gene) + '%'},
        by: "gene",
      }
    } else {  // chrom + position
      return {
        select: "position",
        where: "g.chrom = @chrom AND g.position LIKE @query",
        params: {chrom, query: String(position) + '%'},
        by: "position",
      }
    }
  })();

  // Order peaks in query by average FDR

  return database.findAll(
    `
    SELECT g.${select}, g.minValueAvg, g.nFeatures, g.mostSignificantFeatureID, peaks.assay
    FROM features_by_${by} AS g, peaks
    WHERE ${where} AND g.mostSignificantFeatureID = peaks.id
    ORDER BY g.minValueAvg 
    LIMIT 100
    `,
    params
  )
}


// Helpers

function normalizePeaks(peaks) {
  return peaks.map(p => {
    p.feature = parseFeature(p.feature)
    return p
  })
}
