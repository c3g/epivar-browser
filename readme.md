# Varwig

A web application to search for variant and merge bigWig tracks.

# Installation

Things to do:
 - Install `bigWigMergePlus`: https://github.com/c3g/kent/releases
 - Install `gemini`: https://github.com/c3g/kent/releases
 - `cp config.example.js config.js` and adapt the config
 - `mkdir -p data/mergedTracks`
 - Generate or copy `gemini.db` file
 - Add data:
   - Mount tracks data somewhere
   - IHEC:
     - Copy IHEC database or make sure it's accessible for the application
   - Metadata:
     - Add `data/metadata.json`

External setup:
 - Setup nginx or apache proxy
 - Setup systemd service (see `./varwig.service`)

See `config.example.js` for details about the config.
