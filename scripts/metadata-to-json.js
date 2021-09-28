/*
 * xlsx-to-json.js
 */

const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const sheetNames = [
  'RNA-Seq',
  'ATAC-Seq',
  'H3K27ac',
  'H3K4me1',
  'H3K27me3',
  'H3K4me3',
  'WGB-Seq',
  // 'WGS_variants'
]

const headers = {
  'path':              'file.path',
  'ethnicity':         'ethnicity',
  'condition':         'condition',
  'short_name':        'institution.short_name',
  'sample_name':       'sample_name',
  'donor':             'donor',
  'view':              'track.view',
  'type':              'track.track_type',
  'assembly':          'assembly.name',
  'assay':             'assay.name',
  'assay_id':          'assay.name',
  'assay_category':    'assay_category.name',
  'assay_category_id': 'assay_category.name',
}

const metadataPath = path.join(__dirname, '../input-files/flu-infection.xlsx')
const output = path.join(__dirname, '../data/metadata.json')
const workbook = xlsx.readFileSync(metadataPath)

let items = []

sheetNames.forEach(name => {
  const sheet = workbook.Sheets[name]
  const newItems =
    xlsx.utils.sheet_to_json(sheet)
      .filter(item => item[headers["ethnicity"]] !== "Exclude sample")
      .map(item => Object.fromEntries(
        Object.entries(headers).map(([key, oldKey]) => (
          // Preprocess and remove 'Chipmentation' from assay names if necessary
          oldKey === "assay.name"
            ? [key, item[oldKey].replace("Chipmentation ", "")]
            : [key, item[oldKey]]
        ))
      ));

  items = items.concat(newItems)
})

fs.writeFileSync(output, JSON.stringify(items, null, 2))
