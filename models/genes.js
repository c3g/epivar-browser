/*
 * genes.js
 */

const Database = require('sqlite-objects').Database
const config = require('../config')

const database = new Database(config.paths.genes)

module.exports = {
  findByName,
}

function findByName(name) {
  return database.findOne(`SELECT * FROM genes WHERE name = @name`, { name })
}
