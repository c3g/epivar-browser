/*
 * assays.js
 */


const express = require('express');
const router = express.Router();

const { dataHandler, errorHandler } = require('../helpers/handlers');
const Peaks = require('../models/peaks.js');

router.get('/list', (_req, res) => {
  return Peaks.assays()
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
