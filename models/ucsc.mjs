/*
 * ucsc.js
 */

import Color from "color-js";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

import unindent from "../helpers/unindent.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const otherTracks = fs.readFileSync(path.join(__dirname, './ucsc.other-tracks.txt')).toString();

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
    email info@epigenomesportal.ca
  `
}

function generateGenome(session, assembly) {
  return unindent`
    genome ${assembly}
    trackDb ../track-db/${session}
  `
}

function generateTracks(mergedTracks) {

  const trackBlocks = []

  mergedTracks.forEach((merged, idx) => {
    const baseName = `${merged.assay}__${merged.condition}`

    const parentName = `${baseName}__averages`

    trackBlocks.push(unindent`
      track ${parentName}
      container multiWig
      shortLabel ${parentName}
      longLabel ${parentName}
      type bigWig
      visibility full
      aggregate transparentOverlay
      showSubtrackColorOnUi on
      windowingFunction maximum
      priority 1.${idx}
      configurable on
      dragAndDrop subTracks
      autoScale on
    `)

    const trackType = 'bigWig'

    Object.entries(merged.output).forEach(([type, output]) => {
      if (output === undefined)
        return

      const trackName = `${parentName}__${type}`
      const shortLabel = trackName

      const colors = getColor(type)

      trackBlocks.push(indent(4, unindent`
        track ${trackName}
        type ${trackType}
        parent ${parentName}
        shortLabel ${shortLabel}
        bigDataUrl ${output.url}
        maxHeightPixels 25:25:8
        color ${colors[0]}
        graphTypeDefault points
      `))
    })
  })

  // Add legend 'tracks' - non-data tracks that show the REF/HET/HOM colours
  trackBlocks.push(...["REF", "HET", "HOM"].map((t, i) => unindent`
    track ${t}
    shortLabel Legend: ${t}
    longLabel Legend: ${t}
    type bigBed
    bigDataUrl /otherData/legendItem.bb
    color ${getColor(t)[0]}
    visibility dense
    priority 2.${i}
  `))

  return (
    trackBlocks.join('\n\n')
    // 2021-10-05: Disable these for now at the request of Alain
    //              - David L
    + '\n\n'
    + otherTracks
  )
}

// Thanks to Google Charts
const COLORS = {
  REF: [
    '#87A8E8',
    '#3559A1'
  ],
  HET: [
    '#FFAD33',
    '#B77C25'
  ],
  HOM: [
    '#E038E0',
    '#910591'
  ],
}
/* const COLORS = {
 *   REF: [ '#5C85D6', '#EE5430' ],
 *   HET: [ '#FFAD33', '#13B41D' ],
 *   HOM: [ '#B800B8', '#29CCB8' ],
 * } */

/* Original colors:
 * [
 *   '#3366CC',
 *   '#DC3912',
 *   '#FF9900',
 *   '#109618',
 *   '#990099',
 *   '#3B3EAC',
 *   '#0099C6',
 *   '#DD4477',
 *   '#66AA00',
 *   '#B82E2E',
 *   '#316395',
 *   '#994499',
 *   '#22AA99',
 *   '#AAAA11',
 *   '#6633CC',
 *   '#E67300',
 *   '#8B0707',
 *   '#329262',
 *   '#5574A6',
 *   '#3B3EAC'
 * ] */

function getColor(type) {
  return COLORS[type].map(colorToRGB)
}

function colorToRGB(c) {
  const color = Color(c)
  const r = Math.floor(color.getRed() * 255)
  const g = Math.floor(color.getGreen() * 255)
  const b = Math.floor(color.getBlue() * 255)
  return [r, g, b].join(',')
}

function indent(n, string) {
  return string.replace(/^/mg, ' '.repeat(n))
}
