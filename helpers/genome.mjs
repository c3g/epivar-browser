const AUTOSOMES = [];

for (let i = 1; i < 23; i++) {
  AUTOSOMES.push(i.toString());
}

const SEX_CHROMS = ["X", "Y"];

export const CHROM_ORDER = [...AUTOSOMES, ...SEX_CHROMS, "M"];
