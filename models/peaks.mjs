/*
 * peaks.js
 */


import db from "./db.mjs";

import cache from "../helpers/cache.mjs";
import config from "../config.js";
import Gene from "./genes.mjs";
import {CHROM_ORDER} from "../helpers/genome.mjs";

export default {
  selectByID,
  query,
  queryByRsID: queryBySNP,
  queryByGene,
  chroms,
  rsIDs,
  positions,
  autocompleteWithDetail,
};

const peakSelect = `
p."id" AS "id",
p."valueNI" AS "valueNI",
p."valueFlu" AS "valueFlu",
f."nat_id" AS "feature_str",
f."chrom" AS "feature_chrom",
f."start" AS "feature_start",
f."end" AS "feature_end",
f."strand" AS "feature_strand",
s."nat_id" AS "snp_id",
s."chrom" AS "snp_chrom",
s."position" AS "snp_position",
a."name" AS "assay",
g."name_norm" AS "gene"
`;

// noinspection JSUnresolvedVariable
const normalizePeak = peak => peak && ({
  id: peak.id,
  valueNI: peak.valueNI,
  valueFlu: peak.valueFlu,
  assay: peak.assay,
  gene: peak.gene,
  feature: {
    str: peak.feature_str,
    chrom: peak.feature_chrom,
    start: peak.feature_start,
    end: peak.feature_end,
    strand: peak.feature_strand,
  },
  snp: {
    id: peak.snp_id,
    chrom: peak.snp_chrom,
    position: peak.snp_position,
  },
});
const normalizePeaks = peaks => peaks.map(normalizePeak);

function selectByID(peakID) {
  return db.findOne(
    `
      SELECT ${peakSelect}
      FROM peaks p 
          JOIN features f on p."feature" = f."id"
          JOIN assays a ON f."assay" = a."id"
          JOIN snps s on p."snp" = s."id"
          LEFT JOIN genes g ON f."gene" = g."id" -- having an associated gene is optional
      WHERE p."id" = $1
    `,
    [peakID]
  ).then(normalizePeak);
}

function query(chrom, position) {
  return db.findAll(
    `
      SELECT ${peakSelect}
      FROM peaks p
          JOIN features f ON p."feature" = f."id"
          JOIN assays a ON f."assay" = a."id"
          JOIN snps s ON p."snp" = s."id"
          LEFT JOIN genes g ON f."gene" = g."id" -- having an associated gene is optional
      WHERE s."chrom" = $1
        AND s."position" = $2
      ORDER BY LEAST(p."valueFlu", p."valueNI")
    `,
    [chrom, position]
  ).then(normalizePeaks);
}

function queryBySNP(rsID) {
  return db.findAll(
    `
      SELECT ${peakSelect}
      FROM peaks p
          JOIN features f ON p."feature" = f."id"
          JOIN assays a ON f."assay" = a."id"
          JOIN snps s ON p."snp" = s."id"
          LEFT JOIN genes g ON f."gene" = g."id"
      WHERE s."nat_id" = $1
      ORDER BY LEAST(p."valueFlu", p."valueNI")
    `,
    [rsID]
  ).then(normalizePeaks);
}

function queryByGene(gene) {
  return db.findAll(
    `
      SELECT ${peakSelect}
      FROM peaks p 
          JOIN features f ON p."feature" = f."id"
          JOIN assays a ON f."assay" = a."id"
          JOIN snps s ON p."snp" = s."id"
          JOIN genes g ON f."gene" = g."id"  -- no left join here; it's no longer optional to have a gene associated
      WHERE g."name_norm" = $1
      ORDER BY LEAST(p."valueFlu", p."valueNI")
    `,
    [Gene.normalizeName(gene)]
  ).then(normalizePeaks);
}

const cachedDevChroms = config.development?.chroms;
async function chroms() {
  if (cachedDevChroms) {
    return cachedDevChroms;
  }

  await cache.open();

  // Technically this is SNP chrom, not Peaks chrom...

  const k = "chroms:peaks";
  const r = await cache.getJSON(k);

  if (r) return r;

  const cs = (await (
    db.findAll(`SELECT DISTINCT("chrom") FROM snps`)
      .then(rows => rows.map(r => r.chrom))
  )).sort((a, b) => CHROM_ORDER.indexOf(a) - CHROM_ORDER.indexOf(b));

  await cache.setJSON(k, cs, 60 * 60 * 24 * 180);

  return cs;
}

const cachedRsIDs = config.development.rsIDs || undefined;
function rsIDs(query) {
  if (cachedRsIDs) {
    return Promise.resolve(cachedRsIDs);
  }

  return db.findAll(
    `
     SELECT DISTINCT("nat_id")
       FROM snps
      WHERE "nat_id" LIKE $1
      LIMIT 200
    `,
    [String(query) + '%']
  )
  .then(rows => rows.map(r => r.nat_id))
}

function positions(chrom, position) {
  return db.findAll(
    `
     SELECT DISTINCT("position")
       FROM snps
      WHERE "chrom" = $1
        AND "position"::text LIKE $2
    `,
    [chrom, String(position) + '%']
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
  const k = `autocomplete:${[rsID, gene, chrom, position].join("|")}`;

  const r = await cache.getJSON(k);
  if (r) return r;

  const {select, where, params, by} = (() => {
    if (rsID) {
      let query = String(rsID).toLowerCase().trim();
      if (!query.startsWith("rs")) { query = "rs" + query; }
      query += "%";

      return {
        select: "s.nat_id",
        where: "s.nat_id LIKE $1",
        params: [query],
        by: "snp",
      };
    } else if (gene) {
      return {
        select: "g.name",
        where: "g.name ILIKE $1",
        params: [String(gene).trim() + '%'],
        by: "gene",
      };
    } else {  // chrom + position
      const query = (String(position).replace(/[., ]/g, "")) + "%";
      return {
        select: "s.position",
        where: "s.chrom = $1 AND s.position::text LIKE $2",
        params: [chrom, query],
        by: "snp",
      };
    }
  })();

  // Order peaks in query by minimum p-value

  const res = await db.findAll(
    `
    SELECT ${select}, fb."minValueMin", fb."nFeatures", fb."mostSignificantFeatureID", f.assay
    FROM peaks p 
        JOIN snps s ON p."snp" = s."id"
        JOIN features f ON p."feature" = f."id"
        JOIN genes g ON f."gene" = g."id"
        JOIN features_by_${by} fb ON fb."mostSignificantFeatureID" = p."id"
    WHERE ${where}
    ORDER BY fb."minValueMin"
    LIMIT 50
    `,
    params
  );

  await cache.setJSON(k, res, 60 * 60 * 24 * 180);

  return res;
}
