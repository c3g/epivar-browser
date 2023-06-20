const fs = require('fs');

require('dotenv').config();

const config = require("../config");

const stripQuotes = str => str.replace(/"/g, "").trim();

// TODO: configurable
const ASSAYS = [
  'RNA-seq',
  'ATAC-seq',
  'H3K4me1',
  'H3K4me3',
  'H3K27ac',
  'H3K27me3',
];

const loadingPrecomputedPoints = !!config.paths.pointTemplate;
const precomputedPoints = {};

if (loadingPrecomputedPoints) {
  console.log("Pre-loading precomputed point matrices");

  ASSAYS.forEach(assay => {
    const fc = fs.readFileSync(config.paths.pointTemplate.replace(/\$ASSAY/g, assay))
      .toString()
      .split("\n");

    const sortedSampleNamesAndIndices = fc[0]
      .split("\t")
      .map(s => stripQuotes(s))
      .filter(s => s !== "")
      .map((s, si) => [s, si])
      .sort((a, b) => a[0].localeCompare(b[0]));

    precomputedPoints[assay] = Object.fromEntries(fc.slice(1).filter(x => !!x)
      .map(featureRow => {
        const rd = featureRow.split("\t");
        return [
          stripQuotes(rd[0]),
          sortedSampleNamesAndIndices.map(([_, si]) => parseFloat(rd[si + 1])),
        ];
      }));
  });
}

module.exports = {
  stripQuotes,
  ASSAYS,
  loadingPrecomputedPoints,
  precomputedPoints,
};
