import path from "path";
import child_process from "child_process";

import cache from "./cache.mjs";

/**
 * Executes a command and either returns stdout/stderr upon success,
 * or an exception + the aforementioned streams upon a return error
 * from the child process.
 * @param command
 * @returns {Promise<{err: ExecException|null, stdout: string, stderr: string}>}
 */
const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(
      command,
      {maxBuffer: 1024 * 2000},
      (err, stdout, stderr) =>
        err
          ? reject({err, stderr, stdout})
          : resolve({stdout, stderr})
    ));

// Command generation

const CACHE_EXP = 24 * 60 * 60 * 1000;

const valueCommand = (file, options) => [
    path.join(options.bin, "bigWigSummary"),
    file,
    options.chrom,
    options.start,
    options.end,
    "1"
  ].join(" ");

/**
 * @param {string} file
 * @param {Object} options
 * @param {string} options.chrom
 * @param {number} options.start
 * @param {number} options.end
 * @param {string} [options.bin]
 */
export async function valueAt(file, options) {
  await cache.open();

  const key = "bws:" + [file, options.chrom, options.start, options.end].join("#");

  if (await cache.has(key)) {
    return cache.getJSON(key);
  }

  const command = valueCommand(file, options);

  return exec(command)
    .then(({stdout}) => Promise.resolve(parseFloat(stdout.trim())))
    .then(value => cache.setJSON(key, value, CACHE_EXP).then(() => value))
    .catch(({err, stderr}) => {
      if (stderr.includes('no data in region')) {
        return Promise.resolve(undefined);
      }
      return Promise.reject(err);
    });
}
export default valueAt;
