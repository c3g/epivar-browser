import fs from "node:fs";
import process from "node:process";
import parseCSVSync from "csv-parse/lib/sync.js";

import config from "../config.js";

import {genePathsByAssemblyID} from "../data/assemblies/index.mjs";

const ASSAY_NAME_RNASEQ = "RNA-seq";

const genesPath = genePathsByAssemblyID[config.assembly];
const genesFeaturesPath = process.argv[2] || "/dev/stdin";

import {precomputedPoints} from "./_common.mjs";

import db from "../models/db.mjs";
import Gene from "../models/genes.mjs";

const rnaSeqPrecomputed = precomputedPoints[ASSAY_NAME_RNASEQ];

const assaysByName = Object.fromEntries((await db.findAll("SELECT * FROM assays")).map(r => [r.name, r.id]));

const rnaSeq = assaysByName[ASSAY_NAME_RNASEQ];

const parseGene = line => {
  const fields = line.trim().split('\t');
  return [
    Gene.normalizeGeneName(fields[0]),  // id
    Gene.renameGeneIfNeeded(fields[0]),  // name
  ];
};

const geneLines = fs.readFileSync(genesPath).toString().trim().split('\n');
const genes = geneLines.map(parseGene);
console.log(genes.length, 'records');

// Clear table of existing data
await db.run("TRUNCATE TABLE genes RESTART IDENTITY CASCADE");
await db.run("TRUNCATE TABLE features RESTART IDENTITY CASCADE");

// Add genes and corresponding features
await db.insertMany(`INSERT INTO genes ("name_norm", "name") VALUES ($1, $2)`, genes);

const genesByNormName = Object.fromEntries(
  (await db.findAll(`SELECT * FROM genes`)).map(row => [row.name_norm, row.id]));

const parseGeneFeature = line => {
  const fields = line.trim().split("\t");
  const chrom = fields[1].slice(3);
  const start = +fields[2];
  const end = +fields[3];
  const strand = fields[4];
  const geneNameNorm = Gene.normalizeGeneName(fields[0]);
  const gene = genesByNormName[geneNameNorm];
  if (!gene) return [];
  return [[
    `${chrom}_${start}_${end}_${strand}:${rnaSeq}`,
    chrom, // chrom
    start, // start
    end, // end
    strand, // strand
    rnaSeq,
    gene,
    rnaSeqPrecomputed[fields[0]] ?? rnaSeqPrecomputed[geneNameNorm],  // Pre-computed points
  ]];
};

await db.insertMany(
  `
  INSERT INTO features ("nat_id", "chrom", "start", "end", "strand", "assay", "gene", "points")
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT DO NOTHING
  `,
  geneLines.flatMap(parseGeneFeature),
);

console.log("Done genes.txt");

// --------------------------------------------------------------------------

/**
 * Rows of the gene-peaks CSV, providing links between genes, features, and assays.
 * @type {{peak_ids: string, feature_type: string, symbol: string}[]}
 */
const geneAssayFeatures = parseCSVSync(fs.readFileSync(genesFeaturesPath), {columns: true});

const assayFeatures = geneAssayFeatures.flatMap(row => {
  const featureStr = row.peak_ids.slice(3);
  const feature = featureStr.split("_");

  const assayID = assaysByName[row.feature_type];
  const assayPoints = precomputedPoints[row.feature_type];

  const gene = genesByNormName[Gene.normalizeGeneName(row.symbol)];
  if (!gene) return [];
  return [[
    `${featureStr}:${assayID}`,
    feature.slice(0, feature.length-2).join("_"),  // Some unknown chromosomes have _ in them, how annoying
    +feature.at(-2),
    +feature.at(-1),
    assayID,
    gene,
    assayPoints[featureStr],  // Pre-computed points
  ]];
});

await db.insertMany(
  `
  INSERT INTO features ("nat_id", "chrom", "start", "end", "assay", "gene", "points")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
  assayFeatures,
);

console.log("Done gene-peaks.csv");
