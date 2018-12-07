/*
 * value-at.js
 */


const path = require('path')
const child_process = require('child_process')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) =>
      err ? reject({ err, stderr, stdout }) : resolve({ stdout, stderr })))

module.exports = valueAt

const defaultOptions = {
  bin: '',
}


// Command generation

const cache = new Map()
const cacheInterval = setInterval(() => {
  cache.clear()
}, 24 * 60 * 60 * 1000)
cacheInterval.unref()

const valueCommand = (file, options) => [
    path.join(options.bin, 'bigWigSummary'),
    file,
    options.chrom,
    options.start,
    options.end,
    '1'
  ].join(' ')

/**
 * @param {string} file
 * @param {Object} option
 * @param {string} option.chrom
 * @param {number} option.position
 * @param {number} [option.windowSize]
 * @param {string} [option.bin]
 */
function valueAt(file, userOptions) {
  const options = { ...defaultOptions, ...userOptions }

  const key = [file, options.chrom, options.position].join('#')

  if (cache.has(key))
    return Promise.resolve(cache.get(key))

  if (options.windowSize !== undefined) {
    const halfWindowSize = Math.round(options.windowSize / 2)
    options.start = options.position - halfWindowSize
    options.end   = options.position + halfWindowSize
  } else {
    options.start = options.position
    options.end   = options.position + 1
  }

  const command = valueCommand(file, options)

  return exec(command)
  .then(({ stdout }) => {
    const value = parseFloat(stdout.trim())
    cache.set(key, value)
    return value
  })
  .catch(({ err, stderr, stdout }) => {
    if (stderr.includes('no data in region'))
      return Promise.resolve(undefined)
    return Promise.reject(err)
  })
}
