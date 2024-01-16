const path = require("node:path");

require("dotenv").config();

const getPrefixedEnvVar = (varName, defaultValue = undefined) => {
  const explicitValue = process.env[`EPIVAR_${varName}`] ?? process.env[`VARWIG_${varName}`];
  if (explicitValue === undefined && defaultValue === undefined) {
    throw new Error(`${varName} must be set`);
  }
  return explicitValue ?? defaultValue;
};

// Node Base URL =======================================================================================================

const NODE_BASE_URL = getPrefixedEnvVar("NODE_BASE_URL", "http://localhost:3002")
  .replace(/\/$/, "");

// Database and cache connections ======================================================================================

//  - Postgres connection URI
const PG_CONNECTION = getPrefixedEnvVar(
  "PG_CONNECTION", "postgresql://postgres@localhost:5432/postgres");

//  - Redis connection URI
const REDIS_CONNECTION = getPrefixedEnvVar("REDIS_CONNECTION", "redis://localhost:6379");

// Paths and data locations ============================================================================================

//  - This is the application data directory
const DATA_DIR = path.join(__dirname, "./data");

//  - About Markdown content
const ABOUT_MD_PATH = path.join(DATA_DIR, "about.md");

//  - Static tracks to put in UCSC track hub.
const STATIC_TRACKS_PATH = path.join(DATA_DIR, "ucsc.other-tracks.txt");

//  - Other tracks data (legend tracks)
const OTHER_DATA_PATH = path.join(DATA_DIR, "./otherData");

//  - Track metadata for the dataset this node hosts
const TRACK_METADATA_PATH = getPrefixedEnvVar("TRACK_METADATA_PATH", path.join(DATA_DIR, "metadata.json"));

//  - This is the input data directory
const INPUT_FILES_DIR = path.join(__dirname, "./input-files");

//  - This is the storage volume path for Gemini genotypes and tracks (i.e., very large files / raw data)
const TRACKS_DIR = getPrefixedEnvVar("TRACKS_DIR", "/tracks");

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
const MERGED_TRACKS_DIR = getPrefixedEnvVar("MERGED_TRACKS_DIR", "/mergedTracks");

//  - Genotype VCF file location
const GENOTYPE_VCF_PATH = getPrefixedEnvVar("GENOTYPE_VCF_PATH", path.join(DATA_DIR, "genotypes.vcf.gz"));

// Data settings - import, censorship, and merging ====================================================================

//  - Maximum p-value for a peak - must be at or below this p-value for the peak to get included.
const IMPORT_MAX_P_VAL = parseFloat(getPrefixedEnvVar("IMPORT_MAX_P_VAL", "0.05"));

//  - Maximum genotype group count to censor; above this, genotype group counts and signal distributions are revealed.
const LOW_COUNT_THRESHOLD = parseInt(getPrefixedEnvVar("LOW_COUNT_THRESHOLD", "5"), 10);

//  - Maximum number of merge processes that can run at once; prevents using too many resources.
const MERGE_SEMAPHORE_LIMIT = parseInt(getPrefixedEnvVar("MERGE_SEMAPHORE_LIMIT", "4"), 10);

// Sessions ============================================================================================================

/** @type string */
const SESSION_SECRET = getPrefixedEnvVar("SESSION_SECRET");

// Portal connection ===================================================================================================

//  - We must allow the CORS origin of the EpiVar web portal so that the portal can access the browser
/** @type string */
const PORTAL_ORIGIN = getPrefixedEnvVar("PORTAL_ORIGIN", "flu-infection.vhost38.genap.ca");

// Plot settings =======================================================================================================

// TODO
/** @type number */
const PLOT_MANHATTAN_MIN_P_VAL = parseFloat(getPrefixedEnvVar("MANHATTAN_MIN_P_VAL", "0.10"));
/** @type number */
const PLOT_MANHATTAN_BIN_SIZE = parseInt(getPrefixedEnvVar("MANHATTAN_BIN_SIZE", "100000"));

// Export ==============================================================================================================

module.exports = {
  // Node Base URL
  NODE_BASE_URL,
  // Database and cache connections
  PG_CONNECTION,
  REDIS_CONNECTION,
  // Paths and data locations
  DATA_DIR,
  ABOUT_MD_PATH,
  STATIC_TRACKS_PATH,
  OTHER_DATA_PATH,
  TRACK_METADATA_PATH,
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
  // Sessions
  SESSION_SECRET,
  // Portal connection
  PORTAL_ORIGIN,
  // Plot settings
  PLOT_MANHATTAN_MIN_P_VAL,
  PLOT_MANHATTAN_BIN_SIZE,
};
