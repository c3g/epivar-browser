// noinspection JSUnusedGlobalSymbols

/*
 * samples.js
 */

const child_process = require('child_process')
const csvParse = require('csv-parse/lib/sync')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: 1024 * 10000 }, (err, stdout, stderr) =>
      err ? reject(err) : resolve({ stdout, stderr })))

const config = require('../config.js')
const cache = require("../helpers/cache");

module.exports = {
  query,
  queryMap,
  getChroms,
  getPositions,

  normalizeSamples,
  normalizeSamplesMap,
  getCounts,
  parseLines,
  parseCSV,
}

function query(chrom, start, end = start + 1) {
  const params = `--header --show-samples --format sampledetail`

  const query = escape`
    SELECT chrom, start, end, ref, alt, (gts).(*)
      FROM variants
     WHERE ${[config.samples.filter]}
       AND chrom = ${chrom}
       AND start >= ${start}
       AND end   <= ${end}
  `

  return gemini(query, params)
  .then(res => res.stdout)
  .then(parseCSV)
  .then(normalizeSamples)
}

function queryMap(chrom, start, end = start + 1) {
  const params = `--header --show-samples`

  const query = escape`
    SELECT chrom, start, end, ref, alt, (gts).(*)
      FROM variants
     WHERE ${[config.samples.filter]}
       AND chrom = ${chrom}
       AND start >= ${start}
       AND end <= ${end}`

  return gemini(query, params)
  .then(res => res.stdout)
  .then(parseCSV)
  .then(normalizeSamplesMap)
}

const cachedDevChroms = config.development?.chroms;
async function getChroms() {
  if (cachedDevChroms) {
    return cachedDevChroms;
  }

  await cache.open();

  const k = "varwig:chroms:gemini";
  const r = await cache.getJSON(k);

  if (r) return r;

  const cs = await gemini(`SELECT DISTINCT(chrom) FROM variants WHERE ${config.samples.filter}`)
    .then(parseLines);

  await cache.setJSON(k, cs, 60 * 60 * 24 * 180);

  return cs;
}

function getPositions(chrom, start) {
  return gemini(escape`
    SELECT DISTINCT(start)
      FROM variants
     WHERE ${[config.samples.filter]}
       AND chrom = ${chrom}
       AND start LIKE ${(start || '') + '%'}
     LIMIT 15
  `)
  .then(parseLines)
}


// NOTE: For development, calling gemini on beluga directly
// is much faster. Set EXECUTE_GEMINI_REMOTELY to a non-blank
// value to turn this on. This requires that `beluga` is configured
// in your SSH config to use your username and is an alias for the
// actual beluga hostname.
// IMPORTANT: Do not use this in production!!
const EXECUTE_GEMINI_REMOTELY = process.env.EXECUTE_GEMINI_REMOTELY || false;

function gemini(query, params = '') {
  const remoteGeminiBaseDir = '/cvmfs/soft.mugqic/CentOS6/software/gemini/gemini-0.20.1'

  const path = EXECUTE_GEMINI_REMOTELY
    ? '~/projects/rrg-bourqueg-ad/C3G/projects/DavidB_varwig/WGS_VCFs/allSamples_WGS.gemini.db'
    : config.paths.gemini
  const gemini = EXECUTE_GEMINI_REMOTELY
      ? `${remoteGeminiBaseDir}/shared/anaconda/bin/gemini`
      : 'gemini'
  const command = EXECUTE_GEMINI_REMOTELY
    ? `ssh beluga '\
        PYTHONPATH=${remoteGeminiBaseDir}/shared/anaconda/lib/python2.7/site-packages \
        ${gemini} query ${path} \
        ${params} \
        -q "${query.replace(/"/g, '\\"')}"'`
    : `${gemini} query ${path} \
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

  const first = samples[0] || {}

  const total = samples.length

  return {
    total:  total,
    counts: getCounts(total, samples),
    chrom:  first.chrom,
    start:  first.start,
    end:    first.end,
    ref:    first.ref,
  }
}

function normalizeSamplesMap(samples) {
  const res = samples[0]

  const variants    = new Set(res.variant_samples.split(','))
  // const hetVariants = new Set(res.het_samples.split(','))

  const newRes = { samples: {} }

  for (let key in res) {
    if (key.startsWith('gts.')) {
      const donor = key.slice(4)
      const value = res[key]
      const variant = variants.has(donor)
      const type = !variant ? 'REF' : value.charAt(0) !== value.charAt(2) ? 'HET' : 'HOM'
      newRes.samples[donor] = { value, variant, type }
    } else {
      newRes[key] = res[key]
    }
  }

  return newRes
}

function getCounts(total, samples) {
  const counts = {
    REF: 0,
    HET: 0,
    HOM: 0,
  }
  samples.forEach(sample => {
    const [a, b] = splitSampleValue(sample)
    if (a === sample.alt && b === sample.alt)
      counts.HOM += 1
    else
      counts.HET += 1
  })
  counts.REF = total - counts.HET - counts.HOM

  return counts
}

function splitSampleValue(sample) {
  let parts = sample.value.split(/\||\//)

  // Basic validation
  if (parts.length !== 2)
    throw new Error(`Invalid sample value: "${sample.value}" (sample ${sample.name})`)

  if (!parts.every(p => /^\w$/.test(p)))
    console.log('Invalid sample value:', sample.value)

  return parts
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
  if (Array.isArray(value))
    return value[0]
  switch (typeof value) {
    case 'number':
      return value
    case 'string':
      return '"' + value.replace(/"/g, '\\"') + '"'
    case 'object':
      return value === null ? 'NULL' : "'" + (''+value).replace(/'/g, "''") + "'"
    default:
      throw new Error(`Unrecognized value: ${value}`)
  }
}
