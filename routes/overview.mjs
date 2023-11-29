/*
 * autocomplete.js
 */


import express from "express";
import {dataHandler, errorHandler} from "../helpers/handlers.mjs";
import envConfig from "../envConfig.js";
import Peaks from "../models/peaks.mjs";

const router = express.Router();

router.get("/config", (_req, res) => {
  dataHandler(res)({
    binSize: envConfig.PLOT_MANHATTAN_BIN_SIZE,
    minPValue: envConfig.PLOT_MANHATTAN_MIN_P_VAL,
  });
});

router.get("/assays/:assay/topBinned/:chrom", ({params}, res) => {
  const {assay, chrom} = params;
  Peaks.topBinnedForAssayAndChrom(assay, chrom)
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
