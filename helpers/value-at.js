/*
 * value-at.js
 */


const child_process = require('child_process')

const exec = command =>
  new Promise((resolve, reject) =>
    child_process.exec(command, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) =>
      err ? reject(err) : resolve({ stdout, stderr })))

module.exports = valueAt

const defaultOptions = {
  bin: '',
}

// Command generation

const valueCommand = (file, options) => [
    path.join(options.bin, `bigWigSummary`),
    file,
    options.chrom,
    options.start,
    options.end,
    '1'
  ].join(' ')

function valueAt(file, options) {
  const command = valueCommand(file, options)
  return exec(command).then(({ stdout }) => {
    const output = stdout.trim()
    if (output.startsWith('no data in region'))
      return undefined
    else
      return parseFloat(output)
  })
}
