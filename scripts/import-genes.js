const fs = require("fs");
const path = require("path");
const parseCSVSync = require("csv-parse/lib/sync");

require('dotenv').config();

import config from "../config";

const genesPath = path.join(config.inputFilesDirname, 'flu-infection-genes.txt');
const genesFeaturesPath = path.join(config.inputFilesDirname, 'flu-infection-gene-peaks.csv');

(async () => {
  const db = await import("../models/db.mjs");
  const Gene = await import('../models/genes.mjs');

  const assaysByName = Object.fromEntries((await db.findAll("SELECT * FROM assays")).map(r => [r.name, r.id]));

  const rnaSeq = assaysByName["RNA-seq"];

  const parseGene = line => {
    const fields = line.trim().split('\t');
    return [
      Gene.normalizeName(fields[0]),  // id
      fields[0],  // name
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
    const gene = genesByNormName[Gene.normalizeName(fields[0])];
    if (!gene) return [];
    return [[
      `${chrom}_${start}_${end}_${strand}:${rnaSeq}`,
      chrom, // chrom
      start, // start
      end, // end
      strand, // strand
      rnaSeq,
      gene,
    ]];
  };

  await db.insertMany(
    `
    INSERT INTO features ("nat_id", "chrom", "start", "end", "strand", "assay", "gene")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
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
    const feature = row.peak_ids.slice(3).split("_");
    const assayID = assaysByName[row.feature_type];

    const gene = genesByNormName[Gene.normalizeName(row.symbol)];
    if (!gene) return [];
    return [[
      `${featureStr}:${assayID}`,
      feature.slice(0, feature.length-2).join("_"),  // Some unknown chromosomes have _ in them, how annoying
      +feature.at(-2),
      +feature.at(-1),
      assayID,
      gene,
    ]];
  });

  await db.insertMany(
    `
    INSERT INTO features ("nat_id", "chrom", "start", "end", "assay", "gene")
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    assayFeatures,
  );

  console.log("Done gene-peaks.csv");
})();
