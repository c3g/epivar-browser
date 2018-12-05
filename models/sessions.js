/*
 * sessions.js
 */

const md5 = require('md5')
const db = require('../db.js')

module.exports = {
  create,
  get,
}

function create({ samples, assay, chrom, position, start, end }) {

  samples.sort(Intl.Collator().compare)

  const text = JSON.stringify({ samples, chrom, position, start, end })
  const hash = md5(text)

  return get(hash).then(row => row ? hash :
      db.run(`INSERT INTO sessions VALUES ($hash, $samples, $assay, $chrom, $position, $start, $end)`, {
    $hash: hash,
    $samples: JSON.stringify(samples),
    $chrom: chrom,
    $assay: assay,
    $position: position,
    $start: start,
    $end: end,
  }).then(() => hash))
}

function get(hash) {
  return db.get(`SELECT * FROM sessions WHERE hash = $hash`, { $hash: hash })
    .then(res => res ? (res.samples = JSON.parse(res.samples), res) : undefined)
}
