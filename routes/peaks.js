/*
 * peaks.js
 */


const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Peaks = require('../models/peaks.js')

router.use('/query', (req, res) => {
  const { chrom, position } = req.query

  const query = (() => {
    switch (chrom) {
      case 'rsID':
        return Peaks.queryByRsID(position)
      case 'gene':
        return Peaks.queryByGene(position)
      default:
        return Peaks.query(chrom, Number(position))
    }
  })()

  query
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
