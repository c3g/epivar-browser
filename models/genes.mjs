/*
 * genes.js
 */

const GENE_RENAMES = {
  CCDC132: "VPS50",
  CCDC109B: "MCUB",
  FAM214B: "ATOSB",
  BZRAP1: "TSPOAP1",
  C19orf60: "REX1BD",
  KIAA0100: "BLTP2",
  CRAMP1L: "CRAMP1",
  TCEB3: "ELOA",
};

export const renameGeneIfNeeded = (name) => {
  if (name in GENE_RENAMES) return GENE_RENAMES[name];
  return name;
};

export const normalizeGeneName = (name) => {
  return renameGeneIfNeeded(name.replace(/[^a-zA-Z\d]/g, '-'));
};

export default {
  renameGeneIfNeeded,
  normalizeGeneName,
};
