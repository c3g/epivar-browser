/*
 * metadata.js
 */

const path = require('path')
const clone  = require('lodash.clonedeep')
const config = require('../../config')

const metadata = require(config.source.metadata.path)

module.exports = {
  getTracks,
}

const nameToRealName = name =>
  name.split('_')[1]

/**
 * @param {Object.<string, Object>} samples
 * @param {Object} peak
 */
function getTracks(samples, peak) {
  /*
   * The current gemini database contains names as "Epi_realName_flu_xxx".
   * We need to extract "realName" to make it easier for the rest.
   */
  const samplesByRealName =
    Object.fromEntries(
      Object.entries(samples)
        .map(([key, value]) => [nameToRealName(key), value]))

  const sampleNames = Object.keys(samplesByRealName)
  const conditions = peak.condition.split(',')
  const assay = peak.assay.toLowerCase()

  const tracks =
    metadata
      .filter(track => {
        // TODO test filtering here
        if (assay !== track.assay.toLowerCase())
          return false
        if (!sampleNames.includes(track.donor))
          return false
        if (!conditions.includes(track.condition))
          return false
        if (peak.assay === 'RNA-Seq' &&
              feature.strand === '+' && track.view !== 'signal_forward')
          return false
        return true
      })
      .map(clone)

  tracks.forEach(track => {
    track.path = getLocalPath(track)
    const sample = samplesByRealName[track.donor]
    Object.assign(track, sample)
  })

  return Promise.resolve(tracks)
}

function getLocalPath(track) {
  return path.join(config.paths.tracks, track.path)
}
