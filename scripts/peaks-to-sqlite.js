/*
 * peaks-to-sqlite.js
 */

const path = require('path')
const xlsx = require('xlsx')
const Database = require('sqlite-objects').Database
const Gene = require('../models/genes')


const inputPath = '/home/romgrk/data/flu-infection-peaks.xlsx'
const outputPath = 'peaks.sqlite'
const schemaPath = path.join(__dirname, '../models/peaks.sql')


;(async () => {
  const workbook = xlsx.readFileSync(inputPath)
  const peaks = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).map(normalizePeak)
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
    `INSERT INTO peaks (chrom, position, gene, feature, condition, pvalue, assay)
          VALUES       (@chrom, @position, @gene, @feature, @condition, @pvalue, @assay)`,
    peaks
  )
  console.log('Done')
})()

function normalizePeak(peak) {
  const [chrom, position] = peak.snp.split('_')
  peak.chrom = chrom
  peak.position = +position
  delete peak.snp

  // peak.condition must be "NI", "Flu", or "NI,Flu"
  peak.condition = peak.condition.replace('Non-infected', 'NI').replace(/ \| /g, ',')
  peak.condition = peak.condition.replace('Shared', 'NI,Flu')

  peak.assay = peak.feature_type
  delete peak.feature_type
  return peak
}
