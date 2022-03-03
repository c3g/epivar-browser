/*
 * peaks.js
 */


const Database = require('sqlite-objects').Database

const cache = require("../helpers/cache");
const parseFeature = require('../helpers/parse-feature')
const config = require('../config')

const database = new Database(config.paths.peaks)

module.exports = {
  selectByID,
  query,
  queryByRsID,
  queryByGene,
  chroms,
  assays,
  rsIDs,
  positions,
  autocompleteWithDetail,
}

function selectByID(peakID) {
  return database
    .findOne("SELECT * FROM peaks WHERE id = @peakID", {peakID})
    .then(normalizePeak);
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

const cachedDevChroms = config.development?.chroms;
async function chroms() {
  if (cachedDevChroms) {
    return cachedDevChroms;
  }

  await cache.open();

  const k = "varwig:chroms:peaks";
  const r = await cache.getJSON(k);

  if (r) return r;

  const cs = await database.findAll(
    `
       SELECT DISTINCT(chrom)
         FROM peaks
      `
  ).then(rows => rows.map(r => r.chrom));

  await cache.setJSON(k, cs, 60 * 60 * 24 * 180);

  return cs;
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

async function autocompleteWithDetail(query) {
  const {rsID, gene, chrom, position} = query;

  if ((!rsID && !gene && !chrom && !position) ||
      (!rsID && !gene && chrom && !position) ||
      (!rsID && !gene && !chrom && position)) {
    return [];
  }

  await cache.open();

  // Caching key for autocomplete
  const k = `varwig:autocomplete:${[rsID, gene, chrom, position].join("|")}`;

  const r = await cache.getJSON(k);
  if (r) return r;

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

  const res = await database.findAll(
    `
    SELECT g.${select}, g.minValueAvg, g.nFeatures, g.mostSignificantFeatureID, peaks.assay
    FROM features_by_${by} AS g, peaks
    WHERE ${where} AND g.mostSignificantFeatureID = peaks.id
    ORDER BY g.minValueAvg 
    LIMIT 50
    `,
    params
  );

  await cache.setJSON(k, res, 60 * 60 * 24 * 180);

  return res;
}


// Helpers

function normalizePeak(peak) {
  peak.feature = parseFeature(peak.feature)
  return peak;
}

function normalizePeaks(peaks) {
  return peaks.map(normalizePeak);
}
