import cache from "../helpers/cache.mjs";

console.log("Clearing cache (values only)...");
await cache.open();
await cache.clear("values:*");
console.log("    done.");
process.exit(0);
