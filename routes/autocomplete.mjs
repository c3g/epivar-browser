/*
 * autocomplete.js
 */


import express from "express";

import {ensureLogIn} from "../helpers/auth.mjs";
import { dataHandler, errorHandler } from "../helpers/handlers.mjs";
import Peaks from "../models/peaks.mjs";

const router = express.Router();

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

export default router;
