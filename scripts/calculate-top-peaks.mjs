import config from "../config.js";
import envConfig from "../envConfig.js";
import db from "../models/db.mjs";

import { chromosomeSizesByAssemblyID } from "../data/assemblies/index.mjs";

// Clear relevant table of existing data
await db.run("TRUNCATE TABLE binned_most_significant_peaks RESTART IDENTITY CASCADE");

// Only calculate top binned peaks by assay for chromosomes whose size has been provided in config.js
const chromSizes = chromosomeSizesByAssemblyID[config.source.assembly ?? "hg19"];
const minPValue = envConfig.PLOT_MANHATTAN_MIN_P_VAL;
const binSize = envConfig.PLOT_MANHATTAN_BIN_SIZE;

for (const chrom in chromSizes) {
  const size = chromSizes[chrom];
  const nBins = Math.ceil(size / binSize);
  for (let i = 0; i < nBins; i++) {
    const binLeft = i * binSize;
    const binRight = (i + 1) * binSize - 1;

    // Calculate top peaks for each assay for this bin
    const res = await db.findAll(
      `
      SELECT p."id" 
      FROM peaks p 
          JOIN features f ON p."feature" = f."id"
          JOIN snps s ON p."snp" = s."id"
          JOIN (
              SELECT p3."assay" AS a_id, MIN(p3."peak_p_min") as p_min
              FROM (SELECT f2."assay" AS assay, (SELECT MIN(x) FROM unnest(p2."values") AS x) AS peak_p_min
                    FROM peaks p2
                        JOIN snps s2 on p2."snp" = s2."id"
                        JOIN features f2 on f2."id" = p2."feature"
                    WHERE s2."chrom" = $1
                      AND s2."position" >= $2
                      AND s2."position" <= $3) p3
              GROUP BY a_id
              HAVING MIN(p3."peak_p_min") <= $4
          ) j ON f.assay = j.a_id AND (SELECT MIN(x) FROM unnest(p."values") AS x) = j.p_min
      WHERE s."chrom" = $1
        AND s."position" >= $2
        AND s."position" <= $3
      `,
      [chrom, binLeft, binRight, minPValue]
    );

    await db.insertMany(
      `INSERT INTO binned_most_significant_peaks ("chrom", "pos_bin", "peak")
       VALUES ($1, $2, $3)`,
      res.map(r => [chrom, binLeft, r.id]));

    if (i % 10 === 0) {
      console.log(`chr${chrom}: processed ${i}/${nBins} bins`);
    }
  }
  console.log(`done chr${chrom}`);
}
