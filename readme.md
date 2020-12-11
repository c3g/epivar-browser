# Varwig

A web application to search for variant and merge bigWig tracks.

# Installation

Things to do:
 - Install `bigWigMergePlus`: https://github.com/c3g/kent/releases (bin: https://github.com/c3g/kent/releases/download/bigWigMergePlus_v2.3.2/bigWigMergePlus-mp2b)
 - Install `bigWigInfo` and `bigWigSummary`: http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/
 - Install `gemini`: https://gemini.readthedocs.io/en/latest/
 - `mkdir -p data/mergedTracks`
 - Generate or copy `gemini.db` file
 - Add data:
   - Mount tracks data somewhere
   - IHEC:
     - Copy IHEC database or make sure it's accessible for the application
   - Metadata:
     - Add `data/metadata.json`
 - `cp config.example.js config.js` and adapt the config
 - `npm run build`

External setup:
 - Setup nginx or apache proxy
 - Setup systemd service (see `./varwig.service`)

See `config.example.js` for details about the config.
