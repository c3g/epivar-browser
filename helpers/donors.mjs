import fs from "fs";
import envConfig from "../envConfig.js";

const tracks = JSON.parse(fs.readFileSync(envConfig.TRACK_METADATA_PATH).toString());

const donorLookupSet = new Set();
tracks.forEach(t => {
  donorLookupSet.add(`${t.donor}_${t.condition}`);
});

export const donorLookup = [...donorLookupSet].sort((a, b) => a.localeCompare(b));
