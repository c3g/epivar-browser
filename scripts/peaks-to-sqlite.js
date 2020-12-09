/*
 * peaks-to-sqlite.js
 */

const path = require('path')
const xlsx = require('xlsx')
const Database = require('sqlite-objects').Database


const inputPath = '/home/romgrk/data/flu-infection-peaks.xlsx'
const outputPath = 'peaks.sqlite'
const schemaPath = path.join(__dirname, '../models/peaks.sql')


;(async () => {
  const workbook = xlsx.readFileSync(inputPath)
  const peaks = xlsx.utils.sheet_to_json(workbook.Sheets['peaks']).map(normalizePeak)
  console.log(peaks)
  console.log(peaks.length, 'records')

  const db = new Database(outputPath, schemaPath)
  await db.ready
  await db.insertMany(
    `INSERT INTO peaks (chrom, position, feature, condition, pvalue, assay)
          VALUES       (@chrom, @position, @feature, @condition, @pvalue, @assay)`,
    peaks
  )
  console.log('Done')
})()


function normalizePeak(peak) {
  const [chrom, position] = peak.snp.split('_')
  peak.chrom = chrom
  peak.position = +position
  delete peak.snp

  peak.condition = peak.condition.replace('Non-infected', 'NI').replace(/ \| /g, ',')

  peak.assay = peak.feature_type
  delete peak.feature_type
  return peak
}
