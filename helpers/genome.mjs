const AUTOSOMES = [];

for (let i = 1; i < 23; i++) {
  AUTOSOMES.push(i.toString());
}

const SEX_CHROMS = ["X", "Y"];

export const CHROM_ORDER = [...AUTOSOMES, ...SEX_CHROMS, "M"];

export const normalizeChrom = chrom =>
  (chrom.indexOf("chr") === -1) ? `chr${chrom}` : chrom;

export const GENOTYPE_STATE_REF = "REF";
export const GENOTYPE_STATE_HET = "HET";
export const GENOTYPE_STATE_HOM = "HOM";

export const GENOTYPE_STATES = [GENOTYPE_STATE_REF, GENOTYPE_STATE_HET, GENOTYPE_STATE_HOM];

export const GENOTYPE_STATE_NAMES = {
  [GENOTYPE_STATE_REF]: "Hom Ref",
  [GENOTYPE_STATE_HET]: "Het",
  [GENOTYPE_STATE_HOM]: "Hom Alt",
};
