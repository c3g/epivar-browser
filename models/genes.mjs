/*
 * genes.js
 */

const GENE_RENAMES = {
  CCDC132: "VPS50",
  CCDC109B: "MCUB",
  FAM214B: "ATOSB",
  BZRAP1: "TSPOAP1",
  C19orf60: "REX1BD",
};

export const normalizeGeneName = name => {
  const nameNorm = name.replace(/[^a-zA-Z\d]/g, '-');
  if (nameNorm in GENE_RENAMES) return GENE_RENAMES[nameNorm];
  return nameNorm;
}

export default {
  normalizeGeneName,
};
