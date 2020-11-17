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
 * @param {string} assay
 */
function getTracks(samples, assay) {
  /*
   * The current gemini database contains names as "Epi_realName_flu_xxx".
   * We need to extract "realName" to make it easier for the rest.
   */
  const samplesByRealName =
    Object.fromEntries(
      Object.entries(samples)
        .map(([key, value]) => [nameToRealName(key), value]))

  const sampleNames = Object.keys(samplesByRealName)

  const tracks =
    metadata
      .filter(track => sampleNames.includes(track.donor))
      .map(clone)

  tracks.forEach(track => {
    track.path = getLocalPath(track)
    Object.assign(track, samplesByRealName[track.donor])
  })

  return Promise.resolve(tracks)
}

function getLocalPath(track) {
  return path.join(config.paths.tracks, track.path)
}
