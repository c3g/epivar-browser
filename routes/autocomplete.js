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

  const query = (() => {
    switch (chrom) {
      case 'rsID':
        return Peaks.autocompleteWithDetail({rsID: start})
      case 'gene':
        return Peaks.autocompleteWithDetail({gene: start})
      default:
        return Peaks.autocompleteWithDetail({chrom, position: start})
    }
  })();

  query
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
