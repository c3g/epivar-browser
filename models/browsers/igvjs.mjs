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
      // equivalent to UCSC's maxHeightPixels 25:25:8
      height: 25,
      minHeight: 8,
      maxHeight: 25,
    };

    Object.entries(merged.output).forEach(([type, output]) => {
      if (output === undefined) {
        return;
      }

      parentSubtracks.push({
        name: `${parentName}__${type}`,
        type: "wig",
        format: "bigWig",
        url: output.url,  // TODO: abs url
        color: getColor(type)[0],
      });
    });

    tracks.push(parentTrack);
  });

  // Add legend 'tracks' - non-data tracks that show the REF/HET/HOM colours
  tracks.push(...GENOTYPE_STATES.map((t, i) => ({
    name: t,
    type: "annotation",
    format: "bigBed",
    url: "/otherData/legendItem.bb",  // TODO: abs url
    color: getColor(t)[0],
    displayMode: "COLLAPSED",
  })));

  return tracks;
};

export default {
  generateTracks,
};
