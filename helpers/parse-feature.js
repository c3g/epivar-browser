/*
 * parse-feature.js
 */

module.exports = function parseFeature(feature) {
  const parts = feature.split('_')
  return {
    chrom: parts[0],
    start: Number(parts[1]),
    end:   Number(parts[2]),
    strand: parts[3],
  }
}
