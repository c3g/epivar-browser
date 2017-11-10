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
}

function query(chrom, start, end = start + 1) {
  const command =
    `gemini query ${config.paths.gemini} \
        --header \
        --show-samples \
        --format sampledetail \
        -q "SELECT chrom, start, end, ref, alt, (gts).(*)
              FROM variants
             WHERE chrom = '${chrom}'
               AND start >= ${start}
               AND end   <= ${end}
           "`

  return exec(command).then(res =>
    normalizeSamples(parseCSV(res.stdout))
  )
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

function parseCSV(string) {
  return csvParse(string, { delimiter: '\t', columns: true })
}
