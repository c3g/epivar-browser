# Development

## Dependencies

Install these dependencies according to their own instructions:
- NodeJS version 16+
- Postgres
    - Used for storing SNPs, features, associations (p-values), and other metadata.
    - Tested with versions 13 through 15.
    - See [Setting up the Postgres database](#setting-up-the-postgres-database) for how to prepare this.
- Redis
    - Used for caching values
    - Tested with version 6+
    - note that a Redis instance should never be exposed to the internet!
      EpiVar expects it to be available locally at `localhost:6379`; the default Redis port.
- `bw-merge-window`: https://github.com/c3g/bw-merge-window
- `bigWigSummary`: http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/


## Developing

TODO: Docker compose setup


## Architecture

This is a standard Express backend + React frontend application. Frontend files
live in `./client`, and backend files live at the root of the project.

The API routes are set up in [app.mjs](/app.mjs), and are listed in [routes/](/routes);
the frontend groups all API communication functions in [./client/src/api.js](/client/src/api.js).
The [models/](/models) folder contains the functions to retrieve the actual data,
depending on where it is. Some of it is in Postgres databases (genes, peaks, sessions); the tracks
come from the `tracks` / `mergedTracks` folders configured previously, the variants (aka samples)
data comes from a VCF, and the UCSC track hubs are generated on the fly.

**Note that all code should be written with the assumption that multiple processes can run at a time.**
Thus, Redis/Postgres should generally be used for any cached/persistent data.
