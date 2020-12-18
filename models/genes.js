/*
 * genes.js
 */

const Database = require('sqlite-objects').Database
const config = require('../config')

const database = new Database(config.paths.genes)

module.exports = {
  findByName,
  normalizeName,
}

function findByName(name) {
  const id = normalizeName(name)
  return database.findOne(`SELECT * FROM genes WHERE id = @id`, { id })
}

function normalizeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '-')
}
