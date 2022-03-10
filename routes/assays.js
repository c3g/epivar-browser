/*
 * assays.js
 */


const express = require('express');
const router = express.Router();

const { dataHandler, errorHandler } = require('../helpers/handlers');
const Peaks = require('../models/peaks.js');

// Don't need auth for this; just a list of "RNA-seq", etc.
router.get('/list', (_req, res) => {
  return Peaks.assays()
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
