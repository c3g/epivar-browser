import path from "node:path";

import hg19Sizes from "./hg19/chromosomeSizes.mjs";
import hg38Sizes from "./hg38/chromosomeSizes.mjs";

export const chromosomeSizesByAssemblyID = {
  "hg19": hg19Sizes,
  "hg38": hg38Sizes,
};

export const genePathsByAssemblyID = {
  "hg19": path.join(__dirname, "hg19", "genes.txt"),
  "hg38": path.join(__dirname, "hg38", "genes.txt"),
};
