import fs from "fs";
import config from "../config.js";

const tracks = JSON.parse(fs.readFileSync(config.source.metadata.path).toString());

const donorLookupSet = new Set();
tracks.forEach(t => {
  donorLookupSet.add(`${t.donor}_${t.condition}`);
});

export const donorLookup = [...donorLookupSet].sort((a, b) => a.localeCompare(b));
