/*
 * bigwig-info.js
 */

const path = require('path')
const child_process = require('child_process')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) =>
      err ? reject({ err, stderr, stdout }) : resolve({ stdout, stderr })))

module.exports = bigWigInfo

const defaultOptions = {
  bin: '',
}


// Caching

const cache = new Map()
const cacheInterval = setInterval(() => {
  cache.clear()
}, 24 * 60 * 60 * 1000)
cacheInterval.unref()


// Command generation

const infoCommand = (file, options) => [
    path.join(options.bin, 'bigWigInfo'), file
  ].join(' ')

/*
   version: 4
   isCompressed: yes
   isSwapped: 0
   primaryDataSize: 1,224,382
   primaryIndexSize: 7,756
   zoomLevels: 9
   chromCount: 25
   basesCovered: 199,749
   mean: 7.209771
   min: 0.010604
   max: 123.144417
   std: 10.028175
 */

/**
 * @param {string} file
 * @param {Object} option
 * @param {string} option.chrom
 * @param {number} option.position
 * @param {number} option.start
 * @param {number} option.end
 * @param {string} [option.bin]
 */
function bigWigInfo(file, userOptions) {
  const options = { ...defaultOptions, ...userOptions }

  const key = [file, options.chrom, options.start, options.end].join('#')

  if (cache.has(key))
    return Promise.resolve(cache.get(key))

  const command = infoCommand(file, options)

  return exec(command)
  .then(({ stdout }) => {
    const lines = stdout.trim().split('\n')
    const result = lines.reduce((acc, cur) => {
      const [key, value] = cur.split(': ')
      acc[key] = isNaN(value.replace(/,/g, '')) ? value : parseFloat(value.replace(/,/g, ''))
      return acc
    }, {})
    cache.set(key, result)
    return result
  })
  .catch(({ err, stderr, stdout }) => {
    if (stderr.includes('no data in region'))
      return Promise.resolve(undefined)
    return Promise.reject(err)
  })
}
