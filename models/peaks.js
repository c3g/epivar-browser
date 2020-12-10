/*
 * peaks.js
 */


const Database = require('sqlite-objects').Database
const config = require('../config')

const database = new Database(config.paths.peaks)

module.exports = {
  query,
}

function query(chrom, position) {
  return database.findAll(
    `
     SELECT *
       FROM peaks
      WHERE chrom = @chrom
        AND position = @position
    `,
    { chrom, position }
  )
}
