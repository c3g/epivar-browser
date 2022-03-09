/*
 * samples.js
 */

const express = require('express')
const router = express.Router()

const { dataHandler, errorHandler } = require('../helpers/handlers')
const Samples = require('../models/samples.js')

router.get('/query', ({query}, res) => {
  const { chrom, position } = query;

  Samples.query(chrom, Number(position))
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router
