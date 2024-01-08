/*
 * xlsx-to-json.js
 */

const fs = require('fs');
const path = require('path');
const process = require('node:process');
const xlsx = require('xlsx');

const envConfig = require("../envConfig");

// Sheets to exclude from processing
const EXCLUDE_SHEETS = new Set(["WGS_variants"]);

const headers = {
  'path':              'file.path',
  'ethnicity':         'ethnicity',
  'condition':         'condition',
  'sample_name':       'sample_name',
  'donor':             'donor',
  'view':              'track.view',
  'type':              'track.track_type',
  'assay':             'assay.name',
};

const metadataPath = process.argv[2] || path.join(envConfig.INPUT_FILES_DIR, 'flu-infection.xlsx');
const output = envConfig.TRACK_METADATA_PATH;
const workbook = xlsx.readFileSync(metadataPath);

const items = Object.entries(workbook.Sheets).flatMap(([sheetName, sheet]) => {
  if (EXCLUDE_SHEETS.has(sheetName)) {
    return [];
  }

  return xlsx.utils.sheet_to_json(sheet)
    .filter(item => item[headers["ethnicity"]] !== "Exclude sample")
    .map(item => Object.fromEntries(
      Object.entries(headers)
        .filter(([_, oldKey]) => item[oldKey] !== undefined)
        .map(([key, oldKey]) => (
          // Preprocess and remove 'Chipmentation' from assay names if necessary
          oldKey === "assay.name"
            ? [key, item[oldKey].replace("Chipmentation ", "")]
            : [key, item[oldKey]]
        ))
    ));
});

fs.writeFileSync(output, JSON.stringify(items, null, 2))
