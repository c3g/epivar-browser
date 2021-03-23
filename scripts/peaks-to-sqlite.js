/*
 * peaks-to-sqlite.js
 */

const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')
const parseCSV = require('csv-parse/lib/sync')
const Database = require('sqlite-objects').Database
const Gene = require('../models/genes')


const inputPath = '/home/romgrk/data/flu-infection-peaks-qtls-complete-atacseq.csv'
const outputPath = 'peaks.sqlite'
const schemaPath = path.join(__dirname, '../models/peaks.sql')


;(async () => {
  const peaks = parseCSV(fs.readFileSync(inputPath).toString(), { columns: true }).map(normalizePeak)
  console.log(peaks)
  console.log(peaks.length, 'records')

  await Promise.all(peaks.map(p => {
    if (p.feature.startsWith('chr')) {
      p.gene = null
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

  const db = new Database(outputPath, schemaPath)
  await db.ready
  await db.insertMany(
    `INSERT INTO peaks (rsID,  chrom,  position,  gene,  feature,  assay,  valueNI,  valueFlu)
          VALUES       (@rsID, @chrom, @position, @gene, @feature, @assay, @valueNI, @valueFlu)`,
    peaks
  )
  console.log('Done')
})()


// "rsID",       "snp",           "feature",                "fdr.NI",             "fdr.Flu",            "feature_type"
// "rs13266435", "chr8_21739832", "chr8_21739251_21740780", 1.16446980634725e-11, 6.85657669813694e-13, "ATAC-seq"

function normalizePeak(peak) {
  const [chrom, position] = peak.snp.split('_')
  peak.chrom    = chrom
  peak.position = +position
  delete peak.snp

  peak.valueNI  = peak['fdr.NI']
  peak.valueFlu = peak['fdr.Flu']
  delete peak['fdr.NI']
  delete peak['fdr.Flu']

  peak.assay = peak.feature_type
  delete peak.feature_type

  return peak
}

function parseExcel(inputPath) {
  const workbook = xlsx.readFileSync(inputPath)
  const peaks = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).map(normalizePeak)
  return peaks
}
