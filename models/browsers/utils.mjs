/*
 * models/browsers/utils.js
 */

import Color from "color-js";

import {GENOTYPE_STATE_HET, GENOTYPE_STATE_HOM, GENOTYPE_STATE_REF} from "../../helpers/genome.mjs";
import {NODE_BASE_URL} from "../../envConfig.js";

// Thanks to Google Charts
const COLORS = {
  [GENOTYPE_STATE_REF]: [
    '#87A8E8',
    '#3559A1'
  ],
  [GENOTYPE_STATE_HET]: [
    '#FFAD33',
    '#B77C25'
  ],
  [GENOTYPE_STATE_HOM]: [
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

export const getColor = (type) => COLORS[type].map((c) => colorToRGB(c));

export const colorToRGB = (c) => {
  const color = Color(c)
  const r = Math.floor(color.getRed() * 255)
  const g = Math.floor(color.getGreen() * 255)
  const b = Math.floor(color.getBlue() * 255)
  return [r, g, b].join(',')
};

export const indent = (n, string) => string.replace(/^/mg, ' '.repeat(n));
