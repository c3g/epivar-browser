import {getColor} from "./utils.mjs";
import {GENOTYPE_STATES} from "../../helpers/genome.mjs";

export default {
  generateTracks,
};

const generateTracks = (mergedTracks) => {
  const tracks = [];

  mergedTracks.forEach((merged, idx) => {
    const baseName = `${merged.assay}__${merged.condition}`;
    const parentName = `${baseName}__averages`;

    Object.entries(merged.output).forEach(([type, output]) => {
      if (output === undefined) {
        return;
      }

      const trackName = `${parentName}__${type}`;

      const colors = getColor(type);

      tracks.push({
        name: trackName,
        type: "wig",
        url: output.url,  // TODO: abs url
        color: colors[0],
        displayMode: "EXPANDED",
        // equivalent to UCSC's maxHeightPixels 25:25:8
        height: 25,
        minHeight: 8,
        maxHeight: 25,
      });
    });
  });

  // Add legend 'tracks' - non-data tracks that show the REF/HET/HOM colours
  tracks.push(...GENOTYPE_STATES.map((t, i) => ({
    name: t,
    type: "annotation",
    url: "/otherData/legendItem.bb",  // TODO: abs url
    color: getColor(t)[0],
    displayMode: "COLLAPSED",
  })));

  return tracks;
};
