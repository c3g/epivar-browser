/*
 * autocomplete.js
 */


const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Peaks = require('../models/peaks.js')

router.use('/chroms', (req, res) => {
  Peaks.chroms()
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

router.use('/positions', (req, res) => {
  const { chrom, start } = req.query

  const query = chrom === 'rsID' ?
    Peaks.rsIDs(start) :
    Peaks.positions(chrom, start)

  query
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
