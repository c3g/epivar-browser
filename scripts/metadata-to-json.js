/*
 * xlsx-to-json.js
 */

const process = require('node:process');
const xlsx = require('xlsx');

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

const metadataPath = process.argv[2] || '/dev/stdin';
const workbook = xlsx.readFileSync(metadataPath);

const sheets = Object.entries(workbook.Sheets).filter(([s, _]) => !EXCLUDE_SHEETS.has(s));

process.stderr.write(`Found sheets: ${sheets.map((s) => s[0]).join(', ')}\n`);

const items = sheets.flatMap(([sheetName, sheet]) => {
  const sheetEntries = xlsx.utils.sheet_to_json(sheet)
    .filter(item => item[headers["ethnicity"]] !== "Exclude sample");

  process.stderr.write(`    ${sheetName}: found ${sheetEntries.length} rows\n`);

  return sheetEntries.map(item => Object.fromEntries(
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

process.stdout.write(JSON.stringify(items, null, 2)  + "\n");
