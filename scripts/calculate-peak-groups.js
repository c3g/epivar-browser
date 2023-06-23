(async () => {
  const db = await import("../models/db.mjs");

  console.log('Pre-processing peak groups by SNP')
  // If there is more than one most significant peak, just choose the first one
  await db.run(
    `
          INSERT INTO features_by_snp ("snp", "minValueMin", "nFeatures", "mostSignificantFeatureID")
          SELECT "snp",
                 "minValueMin",
                 "nFeatures",
                 (SELECT "id"
                  FROM peaks
                  WHERE "snp" = a."snp" 
                    AND (SELECT MIN(x) FROM unnest(peaks."values") AS x) = a."minValueMin" 
                  LIMIT 1) AS "mostSignificantFeatureID"
          FROM (SELECT "snp", 
                       MIN((SELECT MIN(x) FROM unnest(peaks."values") AS x)) as "minValueMin", 
                       COUNT(*) AS "nFeatures"
                FROM peaks
                GROUP BY "snp") AS a
      `
  );

  console.log('Pre-processing peak groups by gene');
  // If there is more than one most significant peak, just choose the first one
  await db.run(
    `
          INSERT INTO features_by_gene ("gene", "minValueMin", "nFeatures", "mostSignificantFeatureID")
          SELECT a."gene",
                 a."minValueMin",
                 a."nFeatures",
                 (SELECT peaks."id"
                  FROM peaks JOIN features ON peaks.feature = features.id
                  WHERE features."gene" = a."gene" 
                    AND (SELECT MIN(x) FROM unnest(peaks."values") AS x) = a."minValueMin"
                  LIMIT 1) AS "mostSignificantFeatureID"
          FROM (SELECT f."gene", 
                       MIN((SELECT MIN(x) FROM unnest(peaks."values") AS x)) as "minValueMin", 
                       COUNT(*) AS "nFeatures"
                FROM peaks AS p JOIN features AS f ON p.feature = f.id
                WHERE f."gene" IS NOT NULL
                GROUP BY f."gene") AS a
      `
  );

  // console.log('Pre-processing feature groups by position');
  // await db.run(
  //   `
  //       INSERT INTO features_by_position (chrom, position, minValueMin, nFeatures, mostSignificantFeatureID)
  //       SELECT chrom,
  //              position,
  //              minValueMin,
  //              nFeatures,
  //              (SELECT id
  //               FROM peaks
  //               WHERE chrom = a.chrom
  //                 AND position = a.position
  //                 AND valueMin = a.minValueMin) AS mostSignificantFeatureID
  //       FROM (SELECT chrom, position, MIN(valueMin) as minValueMin, COUNT(*) AS nFeatures
  //             FROM peaks
  //             GROUP BY chrom, position) AS a
  //   `
  // );
})();
