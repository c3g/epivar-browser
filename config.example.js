/*
 * config.js
 */

const path = require('path')


/* This is the application data directory */
const dataDirname = path.join(__dirname, './data')

/* For development: the `tracks` data is huge, so it makes
 * more sense to mount the files via `sshfs` instead of
 * copying them all.
 * You'd mount them with something like:
 *  sshfs beluga.calculcanada.ca:~/projects/rrg-bourqueg-ad/C3G/projects/DavidB_varwig \
 *      ~/mnt/beluga-varwig-data
 * Then you base directory would be:
 */
// const belugaDirname = '/home/romgrk/mnt/beluga-varwig-data'

module.exports = {
  paths: {
    data:         dataDirname,
    mergedTracks: `${dataDirname}/mergedTracks`,

    // In production:
    tracks:       `${dataDirname}/tracks`,
    gemini:       `${dataDirname}/gemini.db`,
    // In development:
    //tracks:       belugaDirname,
    //gemini:       path.join(belugaDirname, 'WGS_VCFs/allSamples_WGS.gemini.db'),
  },

  source: {
    type: 'metadata',
    metadata: {
      path: path.join(__dirname, 'data/metadata.json'),
    },
  },

  // The application was conceived to accept multiple data sources,
  // but for now only `metadata` (above) is tested.
  /* source: {
   *   type: 'ihec',
   *   ihec: {
   *     mysql: {
   *       host:     'localhost',
   *       user:     'root',
   *       password: 'secret',
   *       database: 'edcc',
   *     },
   *   },
   * }, */

  samples: {
    /* Additional filter for samples. The gemini database might contain
     * variants that we don't want to see, this removes them without
     * having to clean the database. */
    filter: 'type = "snp"',
  },

  merge: {
    bin: '',
    /* Maximum number of concurrent bigWigMergePlus processes, to
     * avoid CPU/memory shortage. */
    semaphoreLimit: 2,
  },

  /* Configuration for development related options */
  development: {
    /** @type Array<String> */
    chroms: undefined,
    // Eg
    //chroms: ['chr1', 'chr2', 'chr3' /* etc */],
  },
}
