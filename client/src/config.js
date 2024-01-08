/** @type string[] */
export const EPIVAR_NODES = (EPIVAR_CONFIG.NODES || (process.env.EPIVAR_NODES || "").split(/\s*;\s*/))
  .filter((v) => !!v);
