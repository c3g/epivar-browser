/*
 * models/browsers/ucsc.js
 */

import fs from "fs";

import {STATIC_TRACKS_PATH} from "../../envConfig.js";
import {GENOTYPE_STATES} from "../../helpers/genome.mjs";
import unindent from "../../helpers/unindent.mjs";
import {buildApiPath} from "../../helpers/paths.mjs";
import {getColor, indent} from "./utils.mjs";

export const otherTracks = fs.existsSync(STATIC_TRACKS_PATH) ? fs.readFileSync(STATIC_TRACKS_PATH).toString() : "";

export default {
  otherTracks,
  generateHub,
  generateGenome,
  generateTracks,
};

const buildUcscApiPath = (path) => buildApiPath(`/ucsc${path}`);

function generateHub(session) {
  return unindent`
    hub EpiVar_Dyn_Hub
    shortLabel EpiVar Browser Dynamic Track Hub (Session ID: ${session})
    longLabel EpiVar Browser Dynamic Track Hub (Session ID: ${session})
    genomesFile ${buildUcscApiPath("/genome/")}${session}
    email epivar@computationalgenomics.ca
  `;
}

function generateGenome(session, assembly) {
  return unindent`
    genome ${assembly}
    trackDb ${buildUcscApiPath("/track-db/")}${session}
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
    bigDataUrl ${buildApiPath("/otherData/legendItem.bb")}
    color ${getColor(t)[0]}
    visibility dense
    priority 0.${i+mergedTracks.length+1}
  `));

  return trackBlocks.join('\n\n') + (otherTracks ? `\n\n${otherTracks}` : "");
}

const TRACK_TYPE_BIGWIG = "bigWig";
