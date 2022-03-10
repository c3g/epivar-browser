/*
 * autocomplete.js
 */


const express = require('express');
const router = express.Router();

const {ensureLogIn} = require("../helpers/auth");
const { dataHandler, errorHandler } = require('../helpers/handlers');
const Peaks = require('../models/peaks.js');

router.get('/chroms', (_req, res) => {
  Peaks.chroms()
  .then(dataHandler(res))
  .catch(errorHandler(res));
});

router.get('/positions', ensureLogIn, ({query}, res) => {
  const { chrom, start } = query;

  const queryResults = (() => {
    switch (chrom) {
      case 'rsID':
        return Peaks.autocompleteWithDetail({rsID: start})
      case 'gene':
        return Peaks.autocompleteWithDetail({gene: start})
      default:
        return Peaks.autocompleteWithDetail({chrom, position: start})
    }
  })();

  queryResults
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
