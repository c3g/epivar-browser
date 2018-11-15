/*
 * bigwig-merge.js
 */

const os = require('os')
const fs = require('fs')
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

  const command = [
    path.join(options.bin, `bigWigMergePlus`),
    options.chrom ?
      '-range=' + options.chrom + ((options.start && options.end) ?
        `${options.start}-${options.end}` : ''
      ) :
      '',
    ...files,
    options.output
  ].join(' ')

  log(options)
  log(command)

  exec(command)
  .catch(err =>
    console.error('Error:', err))
}

function log(...args) {
  if (!defaultOptions.verbose)
    return
  console.log(...args)
}
