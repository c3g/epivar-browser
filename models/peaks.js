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
  // TODO: Some nice calculation that encapsulates what we want in a search ranking

  const {rsID, gene, chrom, position} = query;

  const {select, where, params, group} = (() => {
    if (rsID) {
      return {
        select: "rsID, gene",
        where: "rsID LIKE @query",
        params: {query: String(rsID) + '%'},
        group: "rsID",
      }
    } else if (gene) {
      return {
        select: "gene",
        where: "gene LIKE @query",
        params: {query: String(gene) + '%'},
        group: "gene",
      }
    } else {  // chrom + position
      return {
        select: "position, gene",
        where: "chrom = @chrom AND position LIKE @query",
        params: {chrom, query: String(position) + '%'},
        group: "position",
      }
    }
  })();

  return database.findAll(
    `
    SELECT ${select}, minValueNI, minValueFlu, ((minValueNI + minValueFlu) / 2) as avgMinBoth, nFeatures 
    FROM (
        SELECT ${select},
               MIN(valueNI) AS minValueNI,
               MIN(valueFlu) AS minValueFlu,
               COUNT(*) AS nFeatures
          FROM peaks
         WHERE ${where}
      GROUP BY ${group}
    )
    ORDER BY avgMinBoth
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
