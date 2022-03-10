/*
 * samples.js
 */

const express = require('express')
const router = express.Router()

const {ensureLogIn} = require("../helpers/auth");
const { dataHandler, errorHandler } = require('../helpers/handlers')
const Samples = require('../models/samples.js')

router.get('/query', ensureLogIn, ({query}, res) => {
  const { chrom, position } = query;

  Samples.query(chrom, Number(position))
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router
