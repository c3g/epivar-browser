/*
 * samples.js
 */

const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Samples = require('../models/samples.js')

router.use('/', (req, res) => {

  const { chrom, start, end } = req.query

  Samples.query(chrom, start, end)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
