/*
 * autocomplete.js
 */


import express from "express";
import {dataHandler, errorHandler} from "../helpers/handlers.mjs";
import config from "../config.js";
import Peaks from "../models/peaks.mjs";

const router = express.Router();

router.get("/config", (_req, res) => {
  const {chromosomeSizes, minPValue, binSize} = config?.plots?.manhattan ?? {};

  dataHandler(res)({
    binSize,
    minPValue,
    chromosomeSizes,
  });
});

router.get("/assay/:assay/topBinned/:chrom", ({params}, res) => {
  const {assay, chrom} = params;
  Peaks.topBinnedForAssayAndChrom(assay, chrom)
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
