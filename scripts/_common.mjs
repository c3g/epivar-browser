import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

import config from "../config.js";
import {donorLookup} from "../helpers/donors.mjs";

export const stripQuotes = str => str.replace(/"/g, "").trim();

// TODO: configurable
export const ASSAYS = [
  'RNA-seq',
  'ATAC-seq',
  'H3K4me1',
  'H3K4me3',
  'H3K27ac',
  'H3K27me3',
];

export const loadingPrecomputedPoints = !!config.paths.pointTemplate;
export const precomputedPoints = {};

if (loadingPrecomputedPoints) {
  console.log("Pre-loading precomputed point matrices");

  ASSAYS.forEach(assay => {
    const fc = fs.readFileSync(config.paths.pointTemplate.replace(/\$ASSAY/g, assay))
      .toString()
      .split("\n");

    const sampleNamesAndIndices = Object.fromEntries(
      fc[0]
        .split("\t")
        .map(s => stripQuotes(s))
        .filter(s => s !== "")
        .map((s, si) => [s, si])
    );

    precomputedPoints[assay] = Object.fromEntries(fc.slice(1).filter(x => !!x)
      .map(featureRow => {
        const rd = featureRow.split("\t");
        return [
          stripQuotes(rd[0]).replace(/^chr/, ""),
          donorLookup.map(sn => {
            const idx = sampleNamesAndIndices[sn];
            return idx === undefined
              ? null
              : parseFloat(rd[idx + 1]);  // Add one due to funny off-by-one in sample name header
          }),
        ];
      }));
  });
}
