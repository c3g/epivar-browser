/*
 * tracks.js
 */

import path from "path";
import fs from "fs";
import {promisify} from "util";

import md5 from "md5";
import {groupBy, map, path as prop} from "rambda";

import bigWigMerge from "../helpers/bigwig-merge.js";
import bigWigChromosomeLength from "../helpers/bigwig-chromosome-length.js";
import {boxPlot, getDomain, PLOT_HEIGHT, PLOT_WIDTH} from "../helpers/boxplot.mjs";
import cache from "../helpers/cache.mjs";
import valueAt from "../helpers/value-at.mjs";
import config from "../config.js";
import Samples from "./samples.mjs";
import source from "./source/index.js";
import {DEFAULT_CONDITIONS} from "../helpers/defaultValues.mjs";
import {normalizeChrom, GENOTYPE_STATES, GENOTYPE_STATE_NAMES} from "../helpers/genome.mjs";

const exists = promisify(fs.exists);


export default {
  get,
  values,
  group,
  merge,
  calculate,
  plot,
};

const strandToView = {
  "+": "signal_forward",
  "-": "signal_reverse",
};

const groupByEthnicity = groupBy(prop("ethnicity"));
const mapToData = map(prop("data"));

const conditions = config.source?.conditions ?? DEFAULT_CONDITIONS;
const CONDITION_IDS = conditions.map(c => c.id);

const TRACK_VALUES_CACHE_EXPIRY = 60 * 60 * 24 * 180;  // 180 days

// Methods

const _makeTrackDonorLookupArray = tracks => {
  const donorsByCondition = Object.fromEntries(CONDITION_IDS.map(c => [c, []]));
  tracks.forEach(t => donorsByCondition[t.condition].push(t.donor));
  Object.values(donorsByCondition).forEach(v => v.sort());  // Sort donor IDs in place
  return donorsByCondition;
};

function get(peak) {
  const {snp: {chrom, position}} = peak;
  // FIXME remove position - 1 hack (needs clean data)
  return Samples.queryMap(chrom, position - 1)
    .then(info => source.getTracks(info.samples, peak));
}

async function values(peak, usePrecomputed = false) {
  const k = `values:${peak.id}${usePrecomputed ? ':pre' : ''}`;
  const chrom = normalizeChrom(peak.feature.chrom);

  await cache.open();

  // noinspection JSCheckFunctionSignatures
  const cv = await cache.getJSON(k);
  // if (cv) return cv;

  const tracks = await get(peak);

  let getValueForTrack = track => valueAt(track.path, {
    chrom,
    start: peak.feature.start,
    end: peak.feature.end,
    ...config.merge
  });

  if (usePrecomputed) {
    const donorsByCondition = _makeTrackDonorLookupArray(tracks);

    // Replace getter function with one which extracts the precomputed point value.
    getValueForTrack = track => {
      console.log("points", peak.feature.points);
      const condIdx = CONDITION_IDS.indexOf(track.condition);
      if (condIdx === -1) return Promise.resolve(undefined);
      const pointIdx = donorsByCondition[track.condition].indexOf(track.donor);
      if (pointIdx === -1) return Promise.resolve(undefined);
      return Promise.resolve(peak.feature.points?.[condIdx]?.[pointIdx]);
    };
  }

  const result = (await Promise.all(tracks.filter(track =>
    // RNA-seq results are either forward or reverse strand; we only want tracks from the direction
    // of the selected peak (otherwise results will appear incorrectly, and we'll have 2x the # of
    // values we should in some cases.)
    track.assay !== "RNA-Seq" || track.view === strandToView[peak.feature.strand]
  ).map(track =>
    getValueForTrack(track).then(value => (value === undefined ? undefined : {
      id: track.id,
      donor: track.donor,
      assay: track.assay,
      condition: track.condition,
      ethnicity: track.ethnicity,
      variant: track.variant,
      type: track.type,
      value: track.value,
      data: value,
    }))
  ))).filter(v => v !== undefined);

  // await cache.setJSON(k, result, TRACK_VALUES_CACHE_EXPIRY);

  return result;
}

function group(tracks) {
  return Object.fromEntries(
    Object.entries(groupBy(x => x.condition, tracks))
      .map(([condition, tracks]) =>
        [condition, groupBy(prop('type'), tracks)])
  );
}

function calculate(tracksByCondition) {
  Object.keys(tracksByCondition).forEach(condition => {
    const tracksByType = tracksByCondition[condition]
    GENOTYPE_STATES.forEach(g => {
      tracksByType[g] = derive(tracksByType[g] ?? []);
    });
  });

  return tracksByCondition;
}

const MERGE_WINDOW_EXTENT = 100000;  // in bases

function merge(tracks, session) {

  const tracksByCondition = group(tracks);
  const chrom = normalizeChrom(session.peak.feature.chrom);

  const mergeTracksByType = tracksByType =>
    Promise.all(
      GENOTYPE_STATES
        .map(g => tracksByType[g] ?? [])
        .map(async tracks => {
          if (tracks.length === 0) {
            return undefined;
          }

          const filePaths = tracks.map(prop('path'))
          const maxSize = await bigWigChromosomeLength(filePaths[0], chrom)

          return mergeFiles(filePaths, {
            chrom,
            start: Math.max(session.peak.feature.start - MERGE_WINDOW_EXTENT, 0),
            end:   Math.min(session.peak.feature.end + MERGE_WINDOW_EXTENT, maxSize),
          })
        })
    )

  const promisedTracks =
    Object.entries(tracksByCondition).map(([condition, tracksByType]) =>
      mergeTracksByType(tracksByType)
      .then(output => ({
          assay: session.peak.assay,
          condition,
          tracks,
          output: Object.fromEntries(GENOTYPE_STATES.map((g, gi) => [g, output[gi]])),
        })
      )
    )

  return Promise.all(promisedTracks)
    .then(results => results.filter(Boolean))
}

function plot(tracksByCondition) {
  const data = conditions.map(c => tracksByCondition[c.id] ? getDataFromValues(tracksByCondition[c.id]) : []);
  const domains = data.map(d => getDomain(d));

  return Promise.all(
    conditions.map((c, ci) => boxPlot({
      title: c.name,
      data: data[ci],
      domain: domains[ci],
      transform: `translate(${((PLOT_WIDTH / conditions.length) * ci).toFixed(0)} 0)`
    }))
  ).then(plots =>
    `<svg width="${PLOT_WIDTH}" height="${PLOT_HEIGHT}">
       ${plots.join("")}
     </svg>`
  );
}


// Helpers

function getDataFromValues(values) {
  return GENOTYPE_STATES.map(s => ({
    name: GENOTYPE_STATE_NAMES[s],
    data: values[s] ?? [],
  }));
}

function mergeFiles(paths, { chrom, start, end }) {
  paths.sort(Intl.Collator().compare)
  const mergeHash = md5(JSON.stringify({ paths, chrom, start, end }))
  const mergeName = mergeHash + '.bw'
  const url = `/merged/${mergeName}`
  const mergePath = path.join(config.paths.mergedTracks, mergeName)

  return exists(mergePath)
    .then(yes => yes ?
      true :
      bigWigMerge(paths, {
        output: mergePath,
        chrom,
        start,
        end,
        ...config.merge
      })
    )
    .then(() => ({ path: mergePath, url }))
}

function derive(list) {
  const points = list.map(d => d.data).sort((a, b) => a - b)
  const pointsByEthnicity = map(mapToData, groupByEthnicity(list))


  // noinspection JSCheckFunctionSignatures
  return {
    n: list.length,
    stats: getStats(points),
    statsByEthnicity: Object.fromEntries(
      Object.entries(pointsByEthnicity)
        .map(([eth, ethPoints]) => [
          eth,
          getStats(ethPoints.sort((a, b) => a - b))
        ])
    ),

    // Note: Do not send points to the front end – it is too easy to re-identify genotypes
    // from a public bigWig file here.
    points: pointsByEthnicity,
  }
}

function getStats(points) {
  return {
    min:        Math.min(...points),
    quartile_1: points[~~(points.length * 1/4)],
    median:     points[~~(points.length * 2/4)],
    quartile_3: points[~~(points.length * 3/4)],
    max:        Math.max(...points),
  };
}

