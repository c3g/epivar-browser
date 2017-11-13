/*
 * config.js
 */

const path = require('path')

module.exports = {
  paths: {
    db: '/home/rgregoir/data/varwig.db',
    gemini: '/home/rgregoir/data/gemini.db',
    tracks: '/home/rgregoir/data/tracks',
    mergedTracks: '/home/rgregoir/data/mergedTracks',
  },
  mysql: {
    host:     'localhost',
    user:     'root',
    password: 'secret',
    database: 'edcc',
  },
  merge: {
    bin: ''
  },
}
