# Varwig

A web application to search for variant and merge bigWig tracks.

# Installation

Things to do:
 - Install `bigWigMergePlus`: https://github.com/c3g/kent/releases
 - Generate or copy `gemini.db` file
 - Mount `/ihec_data` somewhere
 - Copy IHEC database or make sure it's accessible for the application

A `config.js` must be placed at the root of the application, with the following schema:

```javascript
module.exports = {
  paths: {
    // Location of the varwig DB, mainly for storing sessions
    db: '/home/rgregoir/data/varwig.db',
    // Location of the gemini DB, passed to gemini-query
    gemini: '/home/rgregoir/data/gemini.db',
    // Path to /ihec_data tracks
    tracks: '/home/rgregoir/data/tracks',
    // Path to an empty folder to store merged tracks
    mergedTracks: '/home/rgregoir/data/mergedTracks',
  },
  mysql: { // details to connect to the IHEC database
    host:     'localhost',
    user:     'root',
    password: 'secret',
    database: 'edcc',
  },
  merge: { // install location of Kent tools
    bin: '/usr/local/bin'
  },
}
```
