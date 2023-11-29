/*
 * config.js
 */

const path = require('path');

require('dotenv').config();


/* For development: the `tracks` data is huge, so it makes
 * more sense to mount the files via `sshfs` instead of
 * copying them all.
 * You'd mount them with something like:
 *  sshfs beluga.calculcanada.ca:~/projects/rrg-bourqueg-ad/C3G/projects/DavidB_varwig \
 *      ~/mnt/beluga-varwig-data
 * Then you base directory would be something like:
 * VARWIG_TRACKS_DIR='/home/romgrk/mnt/beluga-varwig-data'
 * VARWIG_GEMINI_DB='/home/romgrk/mnt/beluga-varwig-data/WGS_VCFs/allSamples_WGS.gemini.db'
 */

module.exports = {
  source: {
    type: 'metadata',
    metadata: {
      path: path.join(__dirname, 'data/metadata.json'),
    },

    /*
     * The current gemini database for Aracena et al. contains names as "Epi_realName_flu_xxx".
     * We need to extract "realName" to make it easier for the rest (where "realName" corresponds to
     * the metadata.json "donor" property).
     */
    geminiSampleNameConverter: name => name.split('_')[1],  // name => name

    conditions: [
      {id: "NI", name: "Non-infected"},
      {id: "Flu", name: "Flu"},
    ],
    ethnicities: [
      {id: "AF", name: "African-American", plotColor: "#5100FF", plotBoxColor: "rgba(81, 0, 255, 0.6)"},
      {id: "EU", name: "European-American", plotColor: "#FF8A00", plotBoxColor: "rgba(255, 138, 0, 0.6)"},
    ],
  },

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

  assembly: {
    id: 'hg19',
    chromosomeSizes: {  // This is for HG19; if you want HG38, you will have to change these values
      "1": 249250621,
      "2": 243199373,
      "3": 198022430,
      "4": 191154276,
      "5": 180915260,
      "6": 171115067,
      "7": 159138663,
      "8": 146364022,
      "9": 141213431,
      "10": 135534747,
      "11": 135006516,
      "12": 133851895,
      "13": 115169878,
      "14": 107349540,
      "15": 102531392,
      "16": 90354753,
      "17": 81195210,
      "18": 78077248,
      "19": 59128983,
      "20": 63025520,
      "21": 48129895,
      "22": 51304566,
      // "X": 155270560,
      // "Y": 59373566,
    },
  },

  /* Configuration for development related options */
  development: {
    /** @type Array<String> */
    chroms: undefined,
    // Eg
    //chroms: ['chr1', 'chr2', 'chr3' /* etc */],
  },
}
