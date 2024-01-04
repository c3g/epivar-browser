/** @type string */
export const EPIVAR_BASE_URL = EPIVAR_CONFIG.BASE_URL || process.env.EPIVAR_BASE_URL || "";

/** @type string[] */
export const EPIVAR_NODES = (EPIVAR_CONFIG.NODES || (process.env.EPIVAR_NODES || "").split(/\s*;\s*/))
  .filter((v) => !!v);
