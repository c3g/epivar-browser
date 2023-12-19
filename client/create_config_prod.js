const siteConfig = {
  EPIVAR_BASE_URL: process.env.EPIVAR_BASE_URL || "",
};

if (typeof require !== "undefined" && require.main === module) {
  process.stdout.write(`EPIVAR_CONFIG = ${JSON.stringify(siteConfig, null, 2)};\n`);
}

module.exports = {
  siteConfig,
};
