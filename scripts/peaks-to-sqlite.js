/*
 * peaks-to-sqlite.js
 */

const fs = require('fs')
const path = require('path')
const parseCSV = require('csv-parse/lib/sync')
const Database = require('sqlite-objects').Database
const Gene = require('../models/genes')

// const chipmentationAssays = [
//   'H3K4me1',
//   'H3K4me3',
//   'H3K27ac',
//   'H3K27me3',
// ];

const datasetPaths = [
  'rnaseq',
  'atacseq',
  'h3k4me1',
  'h3k4me3',
  'h3k27ac',
  'h3k27me3',
].map(d => `${path.join(__dirname, '../input-files')}/flu-infection-peaks-qtls-complete-${d}.csv`);

const genePeaksPath = path.join(__dirname, '../input-files/flu-infection-gene-peaks.csv');

const outputPath = path.join(__dirname, '../data/peaks.sqlite');
const schemaPath = path.join(__dirname, '../models/peaks.sql');

(async () => {
  const genesByPeak = Object.fromEntries(
    parseCSV(fs.readFileSync(genePeaksPath).toString(), {columns: true})
      .map(gp => [`${gp.feature_type}:${gp.peak_ids}`, gp]));

  const peaks = datasetPaths
    .flatMap(inputPath => parseCSV(fs.readFileSync(inputPath).toString(), { columns: true }))
    .map(normalizePeak)

  // console.log(peaks)
  console.log(peaks.length, 'records')

  await Promise.all(peaks.map(p => {
    if (p.feature.startsWith('chr')) {
      p.gene = genesByPeak[`${p.assay}:${p.feature}`].symbol ?? null
      return true
    }

    return Gene.findByName(p.feature)
      .then(g => {
        p.gene = p.feature
        if (!g) {
          console.log('Gene not found:', Gene.normalizeName(p.feature))
          console.log(p)
          process.exit(1)
        }
        p.feature = [g.chrom, g.start, g.end, g.strand].join('_')
      })
  }))

  // Remove the database if it already exists
  fs.unlink(outputPath, err => (async () => {
    // Ignore file-not-found errors, since that is OK

    if (!err) console.log(`Removed existing database at '${outputPath}'`)

    console.log('Inserting peaks')
    const db = new Database(outputPath, schemaPath)
    await db.ready
    await db.insertMany(
      `INSERT INTO peaks (id,  rsID,  chrom,  position,  gene,  feature,  assay,  valueNI,  valueFlu,  valueAvg)
        VALUES       (@id, @rsID, @chrom, @position, @gene, @feature, @assay, @valueNI, @valueFlu, @valueAvg)`,
      peaks
    )

    console.log('Pre-processing feature groups by rsID')
    await db.run(
      `
      INSERT INTO features_by_rsID (rsID, minValueAvg, nFeatures, mostSignificantFeatureID)
      SELECT rsID, minValueAvg, nFeatures, (
          SELECT id FROM peaks WHERE rsID = a.rsID AND valueAvg = a.minValueAvg
      ) AS mostSignificantFeatureID 
      FROM (
          SELECT rsID, MIN(valueAvg) as minValueAvg, COUNT(*) AS nFeatures 
          FROM peaks
          WHERE rsID IS NOT NULL
          GROUP BY rsID
      ) AS a
      `
    )

    console.log('Pre-processing feature groups by gene')
    await db.run(
      `
      INSERT INTO features_by_gene (gene, minValueAvg, nFeatures, mostSignificantFeatureID)
      SELECT gene, minValueAvg, nFeatures, (
          SELECT id FROM peaks WHERE gene = a.gene AND valueAvg = a.minValueAvg
      ) AS mostSignificantFeatureID
      FROM (
          SELECT gene, MIN(valueAvg) as minValueAvg, COUNT(*) AS nFeatures
          FROM peaks
          WHERE gene IS NOT NULL
          GROUP BY gene
      ) AS a
      `
    )

    console.log('Pre-processing feature groups by position')
    await db.run(
      `
      INSERT INTO features_by_position (chrom, position, minValueAvg, nFeatures, mostSignificantFeatureID)
      SELECT chrom, position, minValueAvg, nFeatures, (
          SELECT id FROM peaks WHERE chrom = a.chrom AND position = a.position AND valueAvg = a.minValueAvg
      ) AS mostSignificantFeatureID
      FROM (
          SELECT chrom, position, MIN(valueAvg) as minValueAvg, COUNT(*) AS nFeatures
          FROM peaks
          GROUP BY chrom, position
      ) AS a
      `
    )

    console.log('Done')
  })())
})()


// "rsID",       "snp",           "feature",                "fdr.NI",             "fdr.Flu",            "feature_type"
// "rs13266435", "chr8_21739832", "chr8_21739251_21740780", 1.16446980634725e-11, 6.85657669813694e-13, "ATAC-seq"

function normalizePeak(peak, index) {
  // Table is sorted in order of priority
  peak.id = index

  const [chrom, position] = peak.snp.split('_')
  peak.chrom    = chrom
  peak.position = +position
  delete peak.snp

  peak.valueNI  = peak['fdr.NI']
  peak.valueFlu = peak['fdr.Flu']
  peak.valueAvg = (parseFloat(peak.valueNI) + parseFloat(peak.valueFlu)) / 2
  delete peak['fdr.NI']
  delete peak['fdr.Flu']

  peak.assay = peak.feature_type
  // Pre-process the assay name: add the 'Chipmentation '
  // prefix in cases where it's missing from the CSV
  // WE CHANGED OUR MINDS HERE...
  // peak.assay = chipmentationAssays.includes(peak.feature_type)
  //   ? `Chipmentation ${peak.feature_type}`
  //   : peak.feature_type
  delete peak.feature_type

  if (peak.rsID === '.')
    peak.rsID = null

  return peak
}
