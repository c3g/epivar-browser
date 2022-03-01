/*
 * tracks.js
 */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exists = promisify(fs.exists);
const md5 = require('md5');
const {createClient} = require("redis");
const { map, path: prop, groupBy } = require('rambda');

const bigWigMerge = require('../helpers/bigwig-merge');
const bigWigChromosomeLength = require('../helpers/bigwig-chromosome-length');
const {PLOT_SIZE, boxPlot} = require("../helpers/boxplot");
const valueAt = require('../helpers/value-at');
const config = require('../config');
const Samples = require('./samples');

const source = require('./source');
const {getDomain} = require("../helpers/boxplot");

module.exports = {
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
}

const groupByEthnicity = groupBy(prop('ethnicity'))
const mapToData = map(prop('data'))

// Methods

function get(peak) {
  const chrom    = peak.chrom
  const position = peak.position - 1 // FIXME remove position - 1 hack (needs clean data)

  return Samples.queryMap(chrom, position).then(info => {
    return source.getTracks(info.samples, peak)
  })
}

const redisClient = createClient();
redisClient.on("error", err => console.error("[redis]", err.toString()));

async function values(peak) {
  const k = `varwig:${peak.id}`;

  await redisClient.connect();

  try {
    // noinspection JSCheckFunctionSignatures
    const cv = await redisClient.get(k);
    if (cv) return JSON.parse(cv);

    const tracks = await get(peak);

    const result = (await Promise.all(tracks.filter(track =>
      // RNA-seq results are either forward or reverse strand; we only want tracks from the direction
      // of the selected peak (otherwise results will appear incorrectly, and we'll have 2x the # of
      // values we should in some cases.)
      track.assay !== "RNA-Seq" || track.view === strandToView[peak.feature.strand]
    ).map(track =>
      valueAt(track.path, {
        chrom: peak.feature.chrom,
        start: peak.feature.start,
        end: peak.feature.end,
        ...config.merge
      }).then(value => (value === undefined ? undefined : {
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

    // noinspection JSCheckFunctionSignatures
    await redisClient.set(k, JSON.stringify(result), {
      EX: 60 * 60 * 24 * 180
    });

    return result;
  } finally {
    await redisClient.disconnect();
  }
}

function group(tracks) {
  const tracksByCondition = {}
  Object.entries(groupBy(x => x.condition, tracks)).forEach(([condition, tracks]) => {
    tracksByCondition[condition] = groupBy(prop('type'), tracks)
  })
  return tracksByCondition
}

function calculate(tracksByCondition) {
  Object.keys(tracksByCondition).forEach(condition => {
    const tracksByType = tracksByCondition[condition]
    tracksByType.HET = derive(tracksByType.HET || [])
    tracksByType.HOM = derive(tracksByType.HOM || [])
    tracksByType.REF = derive(tracksByType.REF || [])
  })

  return tracksByCondition
}

function merge(tracks, session) {

  const tracksByCondition = group(tracks)

  const mergeTracksByType = tracksByType =>
    Promise.all(
      [
        tracksByType.REF || [],
        tracksByType.HET || [],
        tracksByType.HOM || []
      ].map(async tracks => {
        if (tracks.length === 0) {
          return undefined;
        }

        const filePaths = tracks.map(prop('path'))

        const maxSize = await bigWigChromosomeLength(filePaths[0], session.peak.feature.chrom)

        return mergeFiles(filePaths, {
          chrom: session.peak.feature.chrom,
          start: Math.max(session.peak.feature.start - 100000, 0),
          end:   Math.min(session.peak.feature.end + 100000, maxSize),
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
          output: {
            REF: output[0],
            HET: output[1],
            HOM: output[2],
          }
        })
      )
    )

  return Promise.all(promisedTracks)
    .then(results => results.filter(Boolean))
}

function plot(tracksByCondition) {
  const CONDITION_NI = "NI";
  const CONDITION_FLU = "Flu";

  const niData  = tracksByCondition[CONDITION_NI]  ? getDataFromValues(tracksByCondition[CONDITION_NI])  : [];
  const fluData = tracksByCondition[CONDITION_FLU] ? getDataFromValues(tracksByCondition[CONDITION_FLU]) : [];

  const niDomain  = getDomain(niData)
  const fluDomain = getDomain(fluData)

  console.log("plottin")

  return Promise.all([
    boxPlot({title: "Non-infected", data: niData, domain: niDomain}),
    boxPlot({title: "Flu", data: fluData, domain: fluDomain, transform: "translate(350 0)"}),
  ]).then(plots =>
    `<svg width="${PLOT_SIZE * 2}" height="${PLOT_SIZE}">
       ${plots.join("")}
     </svg>`
  );
}


// Helpers

function getDataFromValues(values) {
  return [
    { name: 'Hom Ref', data: values.REF || [] },
    { name: 'Het',     data: values.HET || [] },
    { name: 'Hom Alt', data: values.HOM || [] }
  ]
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

  const minPoints = 5;

  // noinspection JSCheckFunctionSignatures
  return {
    n: list.length,
    stats: getStats(points),
    statsByEthnicity: Object.fromEntries(
      Object.entries(pointsByEthnicity)
        .map(([eth, ethPoints]) => [
          eth,

          // Don't reveal ethnicity-specific box plots unless we have 4 or more points
          ethPoints.length >= minPoints
            ? getStats(ethPoints.sort((a, b) => a - b))
            : null
        ])
    ),

    // Do not send points to the front end – it is too easy to re-identify genotypes
    // from a public bigWig file here.
    // points: pointsByEthnicity,
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
