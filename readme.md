# flu-infection

A web application to search for variant and merge bigWig tracks.

## Installation

### Third-party dependencies

Install these dependencies according to their own instructions:
 - `bigWigMergePlus`: https://github.com/c3g/kent/releases (bin: https://github.com/c3g/kent/releases/download/bigWigMergePlus_v2.3.2/bigWigMergePlus-mp2b)
 - `bigWigInfo` and `bigWigSummary`: http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/
 - `gemini`: https://gemini.readthedocs.io/en/latest/ (non-trivial, takes some effort, there is a lot of data to download)

They must be on the `PATH` of the application to be called directly.

### Application data

The application requires data from multiple different sources. The data
is also transformed to be consumable by the application. The first step
is therefore to prepare the data. `./input-files` contain the source data
at time of writing as provided by Alain Pacis, but may need to be updated.
The data directory is configurable but the application and this document
will use `./data` by default; this directory contains all the require
runtime data for the application.

Start with `cp config.example.js config.js` to create the required config.
The default config should not need much updating if you follow this document
but you can follow along to make sure everything matches. Make sure `./data`
exists with `mkdir -p ./data`.

The different data sources to generate/prepare are:
 - Genes: list of gene names mapped to their characteristics.
     **Generate with**: `node ./scripts/genes-to-sqlite.js`
     Schema: `./models/genes.sql`
     Input: `./input-files/flu-infection-genes.txt`
     Data: `./data/genes.sqlite`
     Config: `config.paths.genes` (filepath)
     Notes: The `name` column contains their name as provided in the input file,
     however there are inconsistencies in the notation of names, where sometimes
     the `.` and `-` will diverge from one source to another. Therefore, names are
     normalized by replacing all non-digits/non-letters with `-`, and that is the
     `id` used for genes.
 - Peaks: list of peaks names mapped to their characteristics.
     **Generate with**: `node ./scripts/peaks-to-sqlite.js`
     Schema: `./models/peaks.sql`
     Input: `./input-files/flu-infection-peaks-qtls-complete-atacseq.csv`
     Data: `./data/peaks.sqlite`
     Config: `config.paths.peaks` (filepath)
     Notes: The peak's associated feature is usually different from where the
     peak position is. Eg, the peak can be at `chr1:1000`, but the feature is
     at the range `chr1:3500-3600`.
 - Metadata: This is the track's metadata
     **Generate with**: `node ./scripts/metadata-to-json.js`
     Input: `./input-files/flu-infection.xlsx`
     Data: `./data/metadata.json`
     Config: `config.source.metadata.path` (filepath)
     Notes: This is really just an XLSX to JSON transformation.
 - Tracks: There are the bigWig files that contain the signal data.
     **Generate with**: You will need to either copy the files, or
      in development mount them with `sshfs` to have access to them.
      See comment inside `config.example.js` for more details.
     Config: `config.paths.tracks` (directory)
     Notes: A metadata item (from step just before) `.path` field
      point to a path inside the `config.paths.tracks` directory, eg:
      `metadata.path = 'RNAseq/AF02_Flu.forward.bw'`
      `filepath = path.join(config.paths.tracks, metadata.path)`
 - Gemini database: This contains variants' data.
     **Generate with**: Copy it.
     Notes: Accessing it over `sshfs` in development is bad because the
     `gemini` command needs to read it a lot. It might be easier to call
     `gemini` directly on `beluga`. See the comment in `./models/samples.js`
     about the `gemini()` function for more details.
     Fetching the chromosomes list can also be expensive, so for development
     you might want to hardcode the list in the config at
     `config.development.chroms` once you know what that list is.
 - Merged tracks: The directory to store the merged tracks.
     **Generate with**: `mkdir -p ./data/mergedTracks`
     Config: `config.paths.mergedTracks` (directory)
     Notes: Make sure there is enough space for those tracks.

### Application

Once the data is read, you can install & build the application as follow:

```sh
npm run install
# Builds the frontend and copies it under ./public
npm run build
```

In development, you'd run:
 - `npm run watch`: for the backend
 - `cd client && npm start`: for the frontend

In production, you may need to setup these to handle persistence & HTTPS:
 - Setup nginx or apache proxy (see `./nginx.conf`) with letsencrypt certificate
 - Setup systemd service (see `./varwig.service`)
