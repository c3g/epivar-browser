import cache from "../helpers/cache.mjs";

console.log("Clearing cache...");
await cache.open();
await cache.clear();
console.log("    done.");
process.exit(0);
