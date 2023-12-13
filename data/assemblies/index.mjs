import hg19Sizes from "./hg19/chromosomeSizes.mjs";
import hg38Sizes from "./hg38/chromosomeSizes.mjs";

export const chromosomeSizesByAssemblyID = {
  "hg19": hg19Sizes,
  "hg38": hg38Sizes,
};
