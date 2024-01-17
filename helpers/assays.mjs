import config from "../config.js";

export const ASSAY_RNA_SEQ = "RNA-seq";
export const ASSAY_ATAC_SEQ = "ATAC-seq";
export const ASSAY_H3K4ME1 = "H3K4me1";
export const ASSAY_H3K4ME3 = "H3K4me3";
export const ASSAY_H3K27AC = "H3K27ac";
export const ASSAY_H3K27ME3 = "H3K27me3";

export const ALL_ASSAYS = [
  ASSAY_RNA_SEQ,
  ASSAY_ATAC_SEQ,
  ASSAY_H3K4ME1,
  ASSAY_H3K4ME3,
  ASSAY_H3K27AC,
  ASSAY_H3K27ME3,
];

export const AVAILABLE_ASSAYS = config.availableAssays ?? ALL_ASSAYS;
