/*
 * sessions.js
 */

const md5 = require('md5')
const db = require('../db.js')
const Tracks = require('./tracks')

module.exports = {
  create,
  get,
}

async function create({ assay, chrom, position, start, end }) {

  // FIXME change to new API
  const tracksByAssay = await Tracks.values(
    chrom,
    Number(position),
    Number(start),
    Number(end)
  )
  .then(Tracks.group)
  .then(Tracks.clean)

  const samples = Object.values(tracksByAssay[assay]).reduce((acc, cur) => acc.concat(cur), []).map(d => d.donor)
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
