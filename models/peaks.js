/*
 * peaks.js
 */


const Database = require('sqlite-objects').Database
const parseFeature = require('../helpers/parse-feature')
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
    // FIXME position + 1 is a hack because the data is offset by 1
    { chrom, position: position + 1 }
  )
  .then(peaks => peaks.map(p => {
    p.feature = parseFeature(p.feature)
    return p
  }))
}
