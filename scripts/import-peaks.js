// noinspection SqlResolve

const fs = require('fs');
const parseCSV = require('csv-parse');
const copyFrom = require('pg-copy-streams').from;

require('dotenv').config();

const config = require('../config');

const stripQuotes = str => str.replace("\"", "").trim();

// TODO: configurable
const ASSAYS = [
  'RNA-seq',
  'ATACseq',
  'H3K4me1',
  'H3K4me3',
  'H3K27ac',
  'H3K27me3',
];

const datasetPaths = ASSAYS.map(assay => config.paths.qtlsTemplate.replace(/\$ASSAY/g, assay));

const loadingPrecomputedPoints = !!config.paths.pointTemplate;
const precomputedPoints = {};

if (loadingPrecomputedPoints) {
  console.log("Pre-loading precomputed point matrices");

  ASSAYS.forEach(assay => {
    const fc = fs.readFileSync(config.paths.pointTemplate.replace(/\$ASSAY/g, assay))
      .toString()
      .split("\n");

    const sortedSampleNamesAndIndices = fc[0]
      .split("\t")
      .map(s => stripQuotes(s))
      .filter(s => s !== "")
      .map((s, si) => [s, si])
      .sort((a, b) => a[0].localeCompare(b[0]));

    precomputedPoints[assay] = Object.fromEntries(fc.slice(1).map(featureRow => [
      stripQuotes(featureRow[0]),
      sortedSampleNamesAndIndices.map(([_, si]) => parseFloat(featureRow[si + 1])),
    ]));
  })
}

console.log("Loading peaks");

// --------------------------------------------------------------------------

(async () => {
  const db = await import("../models/db.mjs");
  const Gene = await import('../models/genes.mjs');

  // Clear relevant tables of existing data
  await db.run("TRUNCATE TABLE snps RESTART IDENTITY CASCADE");
  await db.run("TRUNCATE TABLE peaks RESTART IDENTITY CASCADE");

  const featureCache = Object.fromEntries(
    (await db.findAll("SELECT * FROM features")).map(row => [row.nat_id, row.id]));

  const client = await db.connect();
  try {
    const assays = Object.fromEntries(
      (await client.query("SELECT * FROM assays")).rows.map(r => [r.name, r]));

    // Preload all gene features
    process.stdout.write("Preloading gene features...");
    const geneCache = Object.fromEntries(
      (await client.query(
        `
          SELECT features.id AS f_id, g.name_norm AS g_n 
          FROM features JOIN genes AS g ON features.gene = g.id
          WHERE features.strand IS NOT NULL
        `)).rows.map(r => [r.g_n, r.f_id])
    );
    process.stdout.write(" done.\n");

    const getFeatureIDOrCreate = async (feature, assay) => {
      const naturalKey = `${feature}:${assay}`;

      if (featureCache.hasOwnProperty(naturalKey)) {
        return featureCache[naturalKey];
      }

      const fs = feature.split("_");
      // TODO: this will break with chrUn
      const res = await db.insert(
        `
          INSERT INTO features ("nat_id", "assay", "chrom", "start", "end" ${fs.length > 3 ? ', "strand"' : ''} ) 
          VALUES ($1, $2, $3, $4, $5 ${fs.length > 3 ? ', $6' : ''} )
          RETURNING id
        `, [naturalKey, assay, fs[0], parseInt(fs[1]), parseInt(fs[2]), ...(fs.length > 3 ? [fs[3]] : [])]);
      featureCache[naturalKey] = res.rows[0].id;
      return featureCache[naturalKey];
    };

    // ------------------------------------------------------------------------

    await client.query(`
        CREATE TEMPORARY TABLE IF NOT EXISTS snps_temp
        (
            "nat_id"   varchar(20) not null,  -- don't enforce primary key until copying to final table
            "chrom"    varchar(10) not null,
            "position" integer     not null
        )
    `);
    await client.query(`
      CREATE TEMPORARY TABLE IF NOT EXISTS peaks_temp
      (
          "id"        serial      primary key,
          "snp"       varchar(20) not null,  -- no FK until we insert to handle missing SNPs
          "feature"   integer     not null,  -- if null, gene FK contains feature information
          "values"    real[]      not null,
          "points"    real[][]
      )
    `);

    const copyToSNPsTable = async () => {
      const tn = "snps_temp";
      await client.query(`
        INSERT INTO snps ("nat_id", "chrom", "position") 
          SELECT "nat_id", "chrom", "position" FROM ${tn}
        ON CONFLICT DO NOTHING
      `);
      await client.query(`TRUNCATE TABLE ${tn}`);
    };
    const copyToPeaksTable = async () => {
      const tn = "peaks_temp";
      await client.query(`
        INSERT INTO peaks ("snp", "feature", "values", "points") 
          SELECT snps."id", pt."feature", pt."values", pt."points"
          FROM ${tn} AS pt JOIN snps ON pt."snp" = snps."nat_id"
      `);
      await client.query(`TRUNCATE TABLE ${tn}`);
    };

    // ------------------------------------------------------------------------

    let totalInserted = 0;
    let totalSNPsInserted = 0;

    let pgSNPCopyStream = null;
    const getNewPgSNPCopyStream = () => client.query(copyFrom(`
      COPY snps_temp (
        "nat_id",
        "chrom",
        "position"
      ) FROM STDIN NULL AS 'null'
    `));
    const snpStreamPush = snp => {
      pgSNPCopyStream.write(Buffer.from(snp.join("\t") + "\n"));
      totalSNPsInserted++;
    };

    let pgPeakCopyStream = null;
    const getNewPgPeakCopyStream = () => client.query(copyFrom(`
        COPY peaks_temp (
          "snp",
          "feature",
          "values"
          "points"
        ) FROM STDIN NULL AS 'null'
      `));

    // const transformNull = v => v === null ? "null" : v;

    /*
     * p: {
     *   assay,
     *   feature,
     *   featureStr,
     *   snp,
     *   snpArray,
     *   values,
     * }
     */
    const peakStreamPush = p => {
      const points = loadingPrecomputedPoints ? precomputedPoints[p.featureStr] : null;
      pgPeakCopyStream.write(Buffer.from([
        p.snp,
        p.feature,
        `"{${p.values.join(",")}}"`,
        points !== null ? `"{${points.join(",")}}"` : "null",
      ].join("\t") + "\n"));
      totalInserted++;
    };

    const getCSVStream = () => parseCSV({delimiter: ",", escape: '"', columns: true});

    const endStreams = () => {
      pgSNPCopyStream.end();
      pgPeakCopyStream.end();
    };

    const snpSet = new Set();

    const copyTempTables = async () => {
      await copyToSNPsTable();
      await copyToPeaksTable();
    };

    for (const inputPath of datasetPaths) {
      let idx = 0;

      console.log(`    ${inputPath}`);

      pgSNPCopyStream = getNewPgSNPCopyStream();
      pgPeakCopyStream = getNewPgPeakCopyStream();

      let t = Date.now();
      try {
        await new Promise((resolve, reject) => {
          const inputStream = fs.createReadStream(inputPath);
          const parseStream = getCSVStream();
          inputStream.pipe(parseStream);

          parseStream
            .on("data", async row => {
              parseStream.pause();

              if (idx > 0 && idx % 100000 === 0) {
                // Flush data from stream to Postgres
                endStreams();

                if (idx % 1000000 === 0) {
                  // Copy temp table once in a while
                  await copyTempTables();
                }

                const nT = Date.now();
                console.log(`        ${idx} (${((nT - t) / 1000).toFixed(1)}s)`);
                t = nT;

                pgSNPCopyStream = getNewPgSNPCopyStream();
                pgPeakCopyStream = getNewPgPeakCopyStream();
              }
              idx++;

              const p = normalizePeak(row);

              if (Math.min(...p.values) >= config.source.pValueMinThreshold) {
                // Not included due to insignificance; skip this peak
                parseStream.resume();
                return;
              }

              // Make sure SNP will exist in snps table
              if (!snpSet.has(p.snpArray[0])) {
                snpStreamPush(p.snpArray);
                snpSet.add(p.snpArray[0]);
              }

              // TODO: move this stuff to normalize
              if (p.feature.startsWith("chr")) {
                // Get the already-created (by import-genes.js) feature if it exists,
                // or make a new one. Pre-created features are associated with genes if
                // specified in the flu-infection-gene-peaks.csv file.
                getFeatureIDOrCreate(p.feature.slice(3), assays[p.assay].id).then(fID => {
                  p.feature = fID;
                  peakStreamPush(p);
                  parseStream.resume();
                }).catch(err => {
                  console.error(err);
                  reject(err);
                });
              } else {
                const gn = Gene.normalizeName(p.feature);
                const pgID = geneCache[gn];

                // getGeneFeatureID(p.feature, assays[p.assay].id).then(pgID => {
                if (!pgID) {
                  if (pgID === undefined) {
                    console.error('        Gene feature not found (skipping associated peaks):', gn);
                    geneCache[gn] = null;
                  }
                  p.feature = null;
                  // console.error(p);
                  // reject(`Gene feature not found: ${Gene.normalizeName(p.feature)}`);
                } else {
                  p.feature = pgID;
                  peakStreamPush(p);
                }
                parseStream.resume();
              }
            })
            .on("end", () => {
              resolve(true);
            });
        });
      } catch (err) {
        console.error(err);
        process.exit(1);
      }

      // ----------------------------------------------------------------------

      endStreams();
      await copyTempTables();
    }

    // ------------------------------------------------------------------------

    console.log('Pre-processing peak groups by SNP')
    // If there is more than one most significant peak, just choose the first one
    await db.run(
      `
          INSERT INTO features_by_snp ("snp", "minValueMin", "nFeatures", "mostSignificantFeatureID")
          SELECT "snp",
                 "minValueMin",
                 "nFeatures",
                 (SELECT "id"
                  FROM peaks
                  WHERE "snp" = a."snp" 
                    AND (SELECT MIN(x) FROM unnest(peaks."values") AS x) = a."minValueMin" 
                  LIMIT 1) AS "mostSignificantFeatureID"
          FROM (SELECT "snp", 
                       MIN((SELECT MIN(x) FROM unnest(peaks."values") AS x)) as "minValueMin", 
                       COUNT(*) AS "nFeatures"
                FROM peaks
                GROUP BY "snp") AS a
      `
    );

    console.log('Pre-processing peak groups by gene');
    // If there is more than one most significant peak, just choose the first one
    await db.run(
      `
          INSERT INTO features_by_gene ("gene", "minValueMin", "nFeatures", "mostSignificantFeatureID")
          SELECT a."gene",
                 a."minValueMin",
                 a."nFeatures",
                 (SELECT peaks."id"
                  FROM peaks JOIN features ON peaks.feature = features.id
                  WHERE features."gene" = a."gene" 
                    AND (SELECT MIN(x) FROM unnest(peaks."values") AS x) = a."minValueMin"
                  LIMIT 1) AS "mostSignificantFeatureID"
          FROM (SELECT f."gene", 
                       MIN((SELECT MIN(x) FROM unnest(peaks."values") AS x)) as "minValueMin", 
                       COUNT(*) AS "nFeatures"
                FROM peaks AS p JOIN features AS f ON p.feature = f.id
                WHERE f."gene" IS NOT NULL
                GROUP BY f."gene") AS a
      `
    );

    // console.log('Pre-processing feature groups by position');
    // await db.run(
    //   `
    //       INSERT INTO features_by_position (chrom, position, minValueMin, nFeatures, mostSignificantFeatureID)
    //       SELECT chrom,
    //              position,
    //              minValueMin,
    //              nFeatures,
    //              (SELECT id
    //               FROM peaks
    //               WHERE chrom = a.chrom
    //                 AND position = a.position
    //                 AND valueMin = a.minValueMin) AS mostSignificantFeatureID
    //       FROM (SELECT chrom, position, MIN(valueMin) as minValueMin, COUNT(*) AS nFeatures
    //             FROM peaks
    //             GROUP BY chrom, position) AS a
    //   `
    // );


    // "rsID",       "snp",           "feature",                "pvalue.NI",  "pvalue.Flu", "feature_type"
    // "rs13266435", "chr8_21739832", "chr8_21739251_21740780", 1.164469e-11, 6.856576e-13, "ATAC-seq"

    function normalizePeak(peak) {
      // Table is sorted in order of priority
      // peak.id = index;

      if (peak.rsID === '.') {
        peak.rsID = null;
      }

      // Cut off [chr] to save space
      const snpSliced = peak.snp.slice(3);
      const [chrom, position] = snpSliced.split('_');
      const snpNaturalID = peak.rsID ?? snpSliced;
      peak.snpArray = [
        snpNaturalID,
        chrom,
        position,
      ]
      peak.snp = snpNaturalID;

      // Save the string representation of the feature for later - we need it to look up precomputed points
      peak.featureStr = peak.feature;

      // const [chrom, position] = peak.snp.split('_');
      // peak.chrom = chrom;
      // peak.position = +position;
      // delete peak.snp;

      peak.values = config.source.conditions.map(c => {
        const k = `pvalue.${c.id}`;
        const val = parseFloat(peak[k]);
        delete peak[k];
        return val;
      });

      peak.assay = peak.feature_type;
      // Pre-process the assay name: add the 'Chipmentation '
      // prefix in cases where it's missing from the CSV
      // WE CHANGED OUR MINDS HERE...
      // peak.assay = chipmentationAssays.includes(peak.feature_type)
      //   ? `Chipmentation ${peak.feature_type}`
      //   : peak.feature_type
      delete peak.feature_type;

      return peak;
    }
  } finally {
    client.release();
  }
})();
