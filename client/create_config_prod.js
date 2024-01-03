const siteConfig = {
  BASE_URL: process.env.EPIVAR_BASE_URL || "",
  NODES: (process.env.EPIVAR_NODES ?? "").split(/\s*;\s*/).filter((v) => !!v),
};

if (typeof require !== "undefined" && require.main === module) {
  process.stdout.write(`EPIVAR_CONFIG = ${JSON.stringify(siteConfig, null, 2)};\n`);
}

module.exports = {
  siteConfig,
};
