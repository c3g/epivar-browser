/*
 * bigwig-merge.js
 */

const os = require('os')
const path = require('path')
const child_process = require('child_process')
const { promisify } = require('util')
const exec = promisify(child_process.exec)

module.exports = bigWigMerge

const defaultOptions = {
  verbose: false,
  bedGraph: false,
  bin: '',
  output: path.join(os.tmpdir(), 'out.bw'),
}

function bigWigMerge(files, userOptions) {
  const options = { ...defaultOptions, ...userOptions }

  if (options.deviation && files.length <= 1)
    throw new Error(`Can't generate standard-deviation for a single track`)

  const command = [
    path.join(options.bin, 'bigWigMergePlus'),
    '-compress',
    '-range=0-1000',
    options.deviation !== undefined ?
      `-deviation=${options.deviation} -deviationDefault=0` :
      '',
    (options.chrom !== undefined && options.start !== undefined && options.end !== undefined) ?
      `-position=${options.chrom}:${options.start}-${options.end}` :
      '',
    ...files,
    options.output
  ].join(' ')

  log(options)
  log(command)

  return exec(command)
  .catch(err =>
    console.error('Error:', err))
}

function log(...args) {
  if (!defaultOptions.verbose)
    return
  console.log(...args)
}
