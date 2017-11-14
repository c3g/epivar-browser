/*
 * samples.js
 */

const child_process = require('child_process')
const { promisify } = require('util')
const exec = promisify(child_process.exec)
const csvParse = require('csv-parse/lib/sync')

const config = require('../config.js')

module.exports = {
  query,
  getChroms,
  getPositions,
}

function query(chrom, start, end = start + 1) {
  const params = `--header --show-samples --format sampledetail`

  const query = escape`
    SELECT chrom, start, end, ref, alt, (gts).(*)
      FROM variants
     WHERE chrom = ${chrom}
       AND start >= ${start}
       AND end   <= ${end}
  `

  return gemini(query, params).then(res =>
    normalizeSamples(parseCSV(res.stdout))
  )
}

function getChroms() {
  return gemini(`SELECT DISTINCT(chrom) FROM variants`)
    .then(parseLines)
}

function getPositions(chrom, start) {
  return gemini(escape`
    SELECT DISTINCT(start)
      FROM variants
     WHERE chrom = ${chrom}
       AND start LIKE ${(start || '') + '%'}
     LIMIT 15
  `)
  .then(parseLines)
}



function gemini(query, params = '') {
  const command =
    `gemini query ${config.paths.gemini} \
        ${params} \
        -q "${query.replace(/"/g, '\\"')}"`

  return exec(command)
}

function normalizeSamples(samples) {
  samples.forEach(sample => {

    sample.value = sample['gts.' + sample.name]

    for (let key in sample) {
      if (key.startsWith('gts.'))
        delete sample[key]
    }
  })
  return samples
}

function parseLines({ stdout }) {
  return stdout.split('\n').filter(Boolean)
}

function parseCSV(string) {
  return csvParse(string, { delimiter: '\t', columns: true })
}

function escape(strings, ...args) {
  let result = ''
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]
    if (i < args.length)
      result += escapeValue(args[i])
  }
  return result
}

function escapeValue(value) {
  switch (typeof value) {
    case 'number':
      return value
    case 'string':
      return "'" + value.replace(/'/g, "''") + "'"
    case 'object':
      return value === null ? 'NULL' : "'" + (''+value).replace(/'/g, "''") + "'"
    default:
      throw new Error(`Unrecognized value: ${value}`)
  }
}

