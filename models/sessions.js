/*
 * sessions.js
 */

const md5 = require('md5')
const db = require('../db.js')

module.exports = {
  create,
  get,
}

function create(samples) {
  const text = JSON.stringify(samples)
  const hash = md5(text)

  return get(hash).then(row => row ? hash : db.run(`INSERT INTO sessions VALUES ($hash, $samples)`, {
    $hash: hash,
    $samples: text,
  }).then(() => hash))
}

function get(hash) {
  return db.get(`SELECT samples FROM sessions WHERE hash = $hash`, { $hash: hash })
    .then(res => res ? JSON.parse(res.samples) : undefined)
}
