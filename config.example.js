/*
 * config.js
 *
 * This file configures the dataset that this EpiVar node is responsible for hosting.
 */

module.exports = {
  source: {
    title: "Aracena 𝘦𝘵 𝘢𝘭.",
    assembly: "hg19",

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

    /*
     * The current gemini database for Aracena et al. contains names as "Epi_realName_flu_xxx".
     * We need to extract "realName" to make it easier for the rest (where "realName" corresponds to
     * the metadata.json "donor" property).
     */
    vcfSampleNameConverter: name => name.split('_')[1],  // name => name
  },

  /* Configuration for development related options */
  development: {
    /** @type Array<String> */
    chroms: undefined,
    // Eg
    //chroms: ['chr1', 'chr2', 'chr3' /* etc */],
  },
}
