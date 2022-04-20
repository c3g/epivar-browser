/*
 * peaks.js
 */


import express from "express";

import {ensureLogIn} from "../helpers/auth.mjs";
import { dataHandler, errorHandler } from '../helpers/handlers.mjs';
import Peaks from '../models/peaks.mjs';

const router = express.Router();

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

export default router;
