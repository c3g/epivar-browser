/*
 * config.js
 *
 * This file configures the dataset that this EpiVar node is responsible for hosting.
 */

const ASSAY_RNA_SEQ = "RNA-seq";
const ASSAY_ATAC_SEQ = "ATAC-seq";
const ASSAY_H3K4ME1 = "H3K4me1";
const ASSAY_H3K4ME3 = "H3K4me3";
const ASSAY_H3K27AC = "H3K27ac";
const ASSAY_H3K27ME3 = "H3K27me3";

// noinspection JSUnusedGlobalSymbols
module.exports = {
  title: "Aracena 𝘦𝘵 𝘢𝘭.",
  assembly: "hg19",

  // availableAssays must be a subset or the set of assays supported by EpiVar:
  availableAssays: [
    ASSAY_RNA_SEQ,
    ASSAY_ATAC_SEQ,
    ASSAY_H3K4ME1,
    ASSAY_H3K4ME3,
    ASSAY_H3K27AC,
    ASSAY_H3K27ME3,
  ],

  conditions: [
    {id: "NI", name: "Non-infected"},
    {id: "Flu", name: "Flu"},
  ],
  ethnicities: [
    {id: "AF", name: "African-American", plotColor: "#5100FF", plotBoxColor: "rgba(81, 0, 255, 0.6)"},
    {id: "EU", name: "European-American", plotColor: "#FF8A00", plotBoxColor: "rgba(255, 138, 0, 0.6)"},
  ],

  samples: {
    /*
     * Additional filter for variants - limit to just first SNP. The VCF might contain variants that we don't want to
     * see, this removes them without having to clean it. The following filter is the default value:
     */
    vcfFindFn: (line) => line.REF.length === 1 && line.ALT.every((a) => a.length === 1),

    /*
     * The current VCF for Aracena et al. contains names as "Epi_realName_flu_xxx".
     * We need to extract "realName" to make it easier for the rest (where "realName" corresponds to
     * the metadata.json "donor" property).
     */
    vcfSampleNameConverter: name => name.split('_')[1],  // name => name

    /*
     * When given a contig from a peak as input, produce a contig compatible with the genotype VCF.
     * For example, peak contigs may be in the format chr1, chr2, ..., whereas VCF contigs may be
     * formatted without the 'chr' prefix (1, 2, ...). Stripping the chr prefix gives the correct
     * VCF contig value.
     */
    vcfChrTransform: (chr) => chr.replace(/^chr/, ""),  // e.g., chr1 => 1

    // bigWigChrTransform: TODO,
  },
};
