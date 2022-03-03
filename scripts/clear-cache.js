const cache = require("../helpers/cache");

(async () => {
  console.log("Clearing cache...");
  await cache.open();
  await cache.clear();
  console.log("    done.");
  process.exit(0);
})();
