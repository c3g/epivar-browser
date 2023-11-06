import {getColor} from "./utils.mjs";
import {GENOTYPE_STATES} from "../../helpers/genome.mjs";

const generateTracks = (mergedTracks) => {
  const tracks = [];

  mergedTracks.forEach((merged, idx) => {
    const baseName = `${merged.assay}__${merged.condition}`;
    const parentName = `${baseName}__averages`;

    const parentSubtracks = [];
    const parentTrack = {
      name: parentName,
      type: "merged",
      tracks: parentSubtracks,
      displayMode: "EXPANDED",
    };

    Object.entries(merged.output).forEach(([type, output]) => {
      if (output === undefined) {
        return;
      }

      parentSubtracks.push({
        name: `${parentName}__${type}`,
        type: "wig",
        format: "bigWig",
        url: output.url,
        color: getColor(type)[0],
        graphType: "points",
        height: 90,
        minHeight: 40,
        maxHeight: 140,
      });
    });

    tracks.push(parentTrack);
  });

  // Add legend 'tracks' - non-data tracks that show the REF/HET/HOM colours
  tracks.push(...GENOTYPE_STATES.map((t, i) => ({
    name: `Legend: ${t}`,
    type: "annotation",
    format: "bigBed",
    url: "/otherData/legendItem.bb",
    color: getColor(t)[0],
    displayMode: "COLLAPSED",
    height: 40,
  })));

  return tracks;
};

export default {
  generateTracks,
};
