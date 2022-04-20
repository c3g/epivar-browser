/*
 * assays.js
 */


import express from 'express';
const router = express.Router();

import { dataHandler, errorHandler } from "../helpers/handlers.mjs";
import Assays from "../models/assays.mjs";

// Don't need auth for this; just a list of "RNA-seq", etc.
router.get('/list', (_req, res) => {
  return Assays.list()
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
