/*
 * bigwig-merge.js
 */

const os = require('os')
const path = require('path')
const child_process = require('child_process')
const { promisify } = require('util')
const exec = promisify(child_process.exec)
const { Semaphore } = require('await-semaphore')
const config = require('../config')

const semaphore = new Semaphore(config.merge.semaphoreLimit)

module.exports = bigWigMerge

const defaultOptions = {
  verbose: false,
  bedGraph: false,
  bin: '',
  output: path.join(os.tmpdir(), 'out.bw'),
}

async function bigWigMerge(files, userOptions) {
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
    (options.chrom !== undefined) ?
      `-position=${options.chrom}` + (options.start !== undefined && options.end !== undefined ? `:${options.start}-${options.end}` : '') :
      '',
    ...files,
    options.output
  ].join(' ')

  log(options)
  log(command)


  let result

  const release = await semaphore.acquire()

  try {
    result = await exec(command)
  } catch(err) {
    result = Promise.reject(err)
  } finally {
    release()
  }

  return result
}

function log(...args) {
  if (!defaultOptions.verbose)
    return
  console.log(...args)
}
