/*
 * samples.js
 */

import express from "express";

import {ensureLogIn} from "../helpers/auth.mjs";
import {dataHandler, errorHandler} from "../helpers/handlers.mjs";
import Samples from "../models/samples.mjs";

const router = express.Router()

router.get('/query', ensureLogIn, ({query}, res) => {
  const { chrom, position } = query;

  Samples.query(chrom, Number(position))
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
