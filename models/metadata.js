/*
 * metadata.js
 */

const fs = require('node:fs');
const path = require('node:path');
const clone  = require('lodash.clonedeep');
const config = require('../config');
const envConfig = require('../envConfig');

const metadata = JSON.parse(fs.readFileSync(envConfig.TRACK_METADATA_PATH).toString());

module.exports = {
  getTracks,
};

/**
 * @param {Object.<string, Object>} samples
 * @param {Object} peak
 */
function getTracks(samples, peak) {
  // Variant sample IDs may not match exactly to donor names. This configured function + map/filter extracts the donor
  // name from the VCF sample ID.
  const samplesByRealName =
    Object.fromEntries(
      Object.entries(samples)
        .map(([key, value]) => [config.samples?.vcfSampleNameConverter(key) ?? undefined, value])
        .filter((e) => e[0] !== undefined));

  const sampleNames = Object.keys(samplesByRealName)
  const assay = peak.assay.toLowerCase()

  const tracks =
    metadata
      .filter(track => {
        // TODO test filtering here
        if (assay !== track.assay.toLowerCase()) return false;
        if (!sampleNames.includes(track.donor)) return false;
        // noinspection RedundantIfStatementJS
        if (peak.assay === 'RNA-Seq' &&
              peak.feature.strand === '+' && track.view !== 'signal_forward') return false;
        return true;
      })
      .map(clone);

  tracks.forEach(track => {
    console.debug("track path before", track.path);
    track.path = getLocalPath(track);
    console.debug("track path after", track.path);
    const sample = samplesByRealName[track.donor];
    Object.assign(track, sample);
  });

  return Promise.resolve(tracks);
}

function getLocalPath(track) {
  return path.join(envConfig.TRACKS_DIR, track.path);
}
