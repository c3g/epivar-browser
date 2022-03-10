/*
 * peaks.js
 */


const express = require('express');
const router = express.Router();

const {ensureLogIn} = require("../helpers/auth");
const { dataHandler, errorHandler } = require('../helpers/handlers');
const Peaks = require('../models/peaks.js');

router.get('/query', ensureLogIn, ({query}, res) => {
  const { chrom, position } = query;

  const queryResults = (() => {
    switch (chrom) {
      case 'rsID':
        return Peaks.queryByRsID(position);
      case 'gene':
        return Peaks.queryByGene(position);
      default:
        return Peaks.query(chrom, Number(position));
    }
  })();

  queryResults
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
