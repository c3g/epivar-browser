const path = require("node:path");

require("dotenv").config();

const getPrefixedEnvVar = (varName, defaultValue) => (
  process.env[`EPIVAR_${varName}`] ??
  process.env[`VARWIG_${varName}`] ??
  defaultValue
);

// Paths and data locations ============================================================================================

//  - This is the application data directory
const DATA_DIR = path.join(__dirname, "./data");

//  - Static tracks to put in UCSC track hub. TODO: make this dataset-specific
const STATIC_TRACKS_PATH = path.join(DATA_DIR, "ucsc.other-tracks.txt");

//  - This is the input data directory
const INPUT_FILES_DIR = path.join(__dirname, "./input-files");

//  - This is the storage volume path for Gemini genotypes and tracks (i.e., very large files / raw data)
const TRACKS_DIR = getPrefixedEnvVar("TRACKS_DIR", "/flu-infection-data");

//  - Template for loading QTL files for each assay; $ASSAY is replaced by the assay ID
const QTLS_TEMPLATE = getPrefixedEnvVar("QTLS_TEMPLATE", `${INPUT_FILES_DIR}/qtls/QTLs_complete_$ASSAY.csv`);

//  - Template for loading pre-computed points for box plots
//      Format: TSV with:
//       - column headers of sample IDs ([DONOR]_[CONDITION])
//       - row headers of features
//    If set to blank, pre-computed points will not be loaded
const POINTS_TEMPLATE = getPrefixedEnvVar(
  "POINTS_TEMPLATE", `${INPUT_FILES_DIR}/matrices/$ASSAY_batch.age.corrected_PCsreg.txt`);

//  - Merged tracks directory path
const MERGED_TRACKS_DIR = getPrefixedEnvVar("MERGED_TRACKS_DIR", path.join(DATA_DIR, "mergedTracks"));

//  - Genotype VCF file location
const GENOTYPE_VCF_PATH = getPrefixedEnvVar("GENOTYPE_VCF_PATH", path.join(DATA_DIR, "genotypes.vcf.gz"));

// Data settings - import, censorship, and merging ====================================================================

//  - Maximum p-value for a peak - must be at or below this p-value for the peak to get included.
const IMPORT_MAX_P_VAL = parseFloat(getPrefixedEnvVar("IMPORT_MAX_P_VAL", "0.05"));

//  - Maximum genotype group count to censor; above this, genotype group counts and signal distributions are revealed.
const LOW_COUNT_THRESHOLD = parseInt(getPrefixedEnvVar("LOW_COUNT_THRESHOLD", "5"), 10);

//  - Maximum number of merge processes that can run at once; prevents using too many resources.
const MERGE_SEMAPHORE_LIMIT = parseInt(getPrefixedEnvVar("MERGE_SEMAPHORE_LIMIT", "4"), 10);

// Plot settings =======================================================================================================

// TODO
const PLOT_MANHATTAN_MIN_P_VAL = parseFloat(getPrefixedEnvVar("MANHATTAN_MIN_P_VAL", "0.10"));
const PLOT_MANHATTAN_BIN_SIZE = parseInt(getPrefixedEnvVar("MANHATTAN_BIN_SIZE", "100000"));

// Export ==============================================================================================================

module.exports = {
  // Paths and data locations
  DATA_DIR,
  STATIC_TRACKS_PATH,
  INPUT_FILES_DIR,
  TRACKS_DIR,
  QTLS_TEMPLATE,
  POINTS_TEMPLATE,
  MERGED_TRACKS_DIR,
  GENOTYPE_VCF_PATH,
  // Data settings - import, censorship, and merging
  IMPORT_MAX_P_VAL,
  LOW_COUNT_THRESHOLD,
  MERGE_SEMAPHORE_LIMIT,
  // Plot settings
  PLOT_MANHATTAN_MIN_P_VAL,
  PLOT_MANHATTAN_BIN_SIZE,
};
