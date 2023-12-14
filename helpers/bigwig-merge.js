/*
 * bigwig-merge.js
 */

const child_process = require('node:child_process');
const { promisify } = require('node:util');
const exec = promisify(child_process.exec);
const { Semaphore } = require('await-semaphore');
const envConfig = require('../envConfig');

const semaphore = new Semaphore(envConfig.MERGE_SEMAPHORE_LIMIT);

module.exports = bigWigMerge;

async function bigWigMerge(files, output, chrom, start, end) {
  const command = [
    'bw-merge-window',
    '--treat-missing-as-zero',
    '--range', '0-1000',
    '--output', output,
    `${chrom}:${start}-${end}`,
    ...files,
  ].join(' ');

  let result;

  const release = await semaphore.acquire();

  try {
    result = await exec(command);
  } catch(err) {
    result = Promise.reject(err);
  } finally {
    release();
  }

  return result;
}
