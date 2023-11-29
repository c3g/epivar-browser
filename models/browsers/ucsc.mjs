/*
 * models/browsers/ucsc.js
 */

import fs from "fs";

import envConfig from "../../envConfig.js";
import {GENOTYPE_STATES} from "../../helpers/genome.mjs";
import unindent from "../../helpers/unindent.mjs";
import {getColor, indent} from "./utils.mjs";

const {STATIC_TRACKS_PATH} = envConfig;

// TODO: specific to dataset
export const otherTracks = fs.existsSync(STATIC_TRACKS_PATH) ? fs.readFileSync(STATIC_TRACKS_PATH).toString() : "";

export default {
  otherTracks,
  generateHub,
  generateGenome,
  generateTracks,
};

function generateHub(session) {
  return unindent`
    hub EpiVar_Dyn_Hub
    shortLabel EpiVar Browser Dynamic Track Hub (Session ID: ${session})
    longLabel EpiVar Browser Dynamic Track Hub (Session ID: ${session})
    genomesFile ../genome/${session}
    email epivar@computationalgenomics.ca
  `;
}

function generateGenome(session, assembly) {
  return unindent`
    genome ${assembly}
    trackDb ../track-db/${session}
  `;
}

function generateTracks(mergedTracks) {
  const trackBlocks = [];

  mergedTracks.forEach((merged, idx) => {
    const baseName = `${merged.assay}__${merged.condition}`;
    const parentName = `${baseName}__averages`;

    trackBlocks.push(unindent`
      track ${parentName}
      container multiWig
      shortLabel ${parentName}
      longLabel ${parentName}
      type ${TRACK_TYPE_BIGWIG}
      visibility full
      aggregate transparentOverlay
      showSubtrackColorOnUi on
      windowingFunction maximum
      priority 0.${idx+1}
      configurable on
      dragAndDrop subTracks
      autoScale on
    `);

    Object.entries(merged.output).forEach(([type, output]) => {
      if (output === undefined) {
        return;
      }

      const trackName = `${parentName}__${type}`;
      const shortLabel = trackName;

      const colors = getColor(type);

      trackBlocks.push(indent(4, unindent`
        track ${trackName}
        type ${TRACK_TYPE_BIGWIG}
        parent ${parentName}
        shortLabel ${shortLabel}
        bigDataUrl ${output.url}
        maxHeightPixels 25:25:8
        color ${colors[0]}
        graphTypeDefault points
      `));
    });
  });

  // Add legend 'tracks' - non-data tracks that show the REF/HET/HOM colours
  trackBlocks.push(...GENOTYPE_STATES.map((t, i) => unindent`
    track ${t}
    shortLabel Legend: ${t}
    longLabel Legend: ${t}
    type bigBed
    bigDataUrl /otherData/legendItem.bb
    color ${getColor(t)[0]}
    visibility dense
    priority 0.${i+mergedTracks.length+1}
  `));

  return trackBlocks.join('\n\n') + (otherTracks ? `\n\n${otherTracks}` : "");
}

const TRACK_TYPE_BIGWIG = "bigWig";
