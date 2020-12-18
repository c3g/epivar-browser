/*
 * samples.js
 */

const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Samples = require('../models/samples.js')

router.use('/query', (req, res) => {
  const { chrom, position } = req.query

  Samples.query(chrom, Number(position))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
