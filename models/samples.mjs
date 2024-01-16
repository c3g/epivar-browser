// noinspection JSUnusedGlobalSymbols

/*
 * samples.js
 */

import Tabix from "@gmod/tabix";
import VCF from "@gmod/vcf";

import config from "../config.js";
import envConfig from "../envConfig.js";
import {
  GENOTYPE_STATE_HET,
  GENOTYPE_STATE_HOM,
  GENOTYPE_STATE_REF,
} from "../helpers/genome.mjs";

const { TabixIndexedFile } = Tabix;

const VCF_TABIX_FILE = new TabixIndexedFile({ path: envConfig.GENOTYPE_VCF_PATH });
const vcfParser = new VCF.default({ header: await VCF_TABIX_FILE.getHeader() });
const vcfFilterFn = config.samples?.vcfFindFn
  ?? ((line) => line.REF.length === 1 && line.ALT.every((a) => a.length === 1));
const vcfChrTransform = config.samples?.vcfChrTransform ?? ((chr) => chr);

export default {
  queryMap,
};

export function queryMap(chrom, start, end = start) {
  return vcfQuery(vcfChrTransform(chrom), parseInt(start.toString(), 10), parseInt(end.toString(), 10))
    .then(normalizeSamplesMap);
}


export async function vcfQuery(contig, start, end) {
  const lines = [];
  // tabix JS takes in 0-based half-open coordinates, which we convert from queryMap taking 1-based closed coordinates
  await VCF_TABIX_FILE.getLines(contig, start - 1, end, line => lines.push(vcfParser.parseLine(line)));
  return lines;
}


export function normalizeSamplesMap(lines) {
  const variant = lines.find(vcfFilterFn);

  if (!variant) return undefined;

  const variantData = {
    chrom: variant.CHROM,
    start: variant.POS,
    end: variant.POS + variant.REF.length,
    ref: variant.REF,
    alts: variant.ALT,
  };

  const res = { ...variantData, samples: {} };

  const variants = variant.SAMPLES;

  Object.entries(variants).forEach(([ sampleID, record ]) => {
    const value = record.GT[0];
    const gt = value.split(/[|/]/);

    if (gt.length !== 2) return;  // TODO: only works for diploid

    const type = (gt[0] === "0" && gt[1] === "0")
      ? GENOTYPE_STATE_REF
      : (gt[0] !== gt[1] ? GENOTYPE_STATE_HET : GENOTYPE_STATE_HOM);

    res.samples[sampleID] = { value, type, variant: variantData };
  });

  return res;
}
