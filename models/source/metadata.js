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

function getTracks(samples, assay) {

  const sampleNames = Object.keys(samples)

  const tracks =
    metadata
      .filter(track => sampleNames.some(s => s.includes(`_${track.donor}_`)))
      .map(clone)

  tracks.forEach(track => {
    track.path = getLocalPath(track)
    Object.assign(track, samples[track.donor])
  })

  return Promise.resolve(tracks)
}

function getLocalPath(track) {
  return path.join(config.paths.tracks, track.path)
}
