/*
 * bigwig-merge-safe.js
 */

const os = require('os')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const { promisify } = require('util')
const exec = promisify(child_process.exec)
const writeFile = promisify(fs.writeFile)
const cuid = require('cuid')
const remove = filename => new Promise((resolve, reject) =>
  fs.unlink(filename, (err) => err ? reject(err) : resolve()))

const basename = filename => path.basename(filename, path.extname(filename))
const changeExtname = (filename, ext) => path.join(path.dirname(filename), basename(filename) + ext)

module.exports = bigWigMerge

const defaultOptions = {
  verbose: false,
  bedGraph: false,
  bin: '',
  output: path.join(os.tmpdir(), 'out.bw'),
}

// Command generation

const toWigCommand = (file, options) => {
  const output = path.join(os.tmpdir(), options.id + '_' + path.basename(changeExtname(file, '.wig')))
  return {
    output: output,
    command: [
      path.join(options.bin, `bigWigToWig`),
      `${ options.chrom ? '-chrom=' + options.chrom : '' }`,
      `${ options.start ? '-start=' + options.start : '' }`,
      `${ options.end ? '-end=' + options.end : '' }`,
      file,
      output
    ].join(' ')
  }
}

const toBigWigCommand = (file, options) => {
  const output = path.join(os.tmpdir(), options.id + '_' + path.basename(changeExtname(file, '.out.bw')))
  return {
    output: output,
    command: [
      path.join(options.bin, `wigToBigWig`),
      file,
      options.sizeFile,
      output
    ].join(' ')
  }
}

const mergeCommand = (files, output, options) => {
  return {
    output: output,
    command: [
      path.join(options.bin, `bigWigMerge`),
      files.join(' '),
      output
    ].join(' ')
  }
}

const bigWigToBedGraphCommand = (file, output, options) => {
  return {
    output: output,
    command: [
      path.join(options.bin, `bigWigToBedGraph`),
      file,
      output
    ].join(' ')
  }
}

const bedGraphToBigWigCommand = (file, options) => ({
    output: options.output,
    command: [
      path.join(options.bin, `bedGraphToBigWig`),
      file,
      options.sizeFile,
      options.output
    ].join(' ')
  })


function bigWigMerge(files, userOptions) {
  const options = { ...defaultOptions, ...userOptions, id: cuid() }

  options.sizeFile = path.join(os.tmpdir(), `chrom-${options.id}.sizes`)
  options.bedFile  = path.join(os.tmpdir(), `out-${options.id}.bedGraph`)

  log(options, '\n')

  // Files that will need to be removed
  const tempFiles = []

  log('bigWigToWig -------------------------------------------------------')
  Promise.all( // bigWigToWig
    files.map(file => {

      const to = toWigCommand(file, options)
      log(' Running:', to.command)

      return exec(to.command).then(() => to.output)
    })
    .concat(
      writeFile(options.sizeFile, [options.chrom, Number(options.end) > 99999999 ? options.end : 99999999].join(' '))
        .then(() => options.sizeFile))
  )
  .then((files) => { // wigToBigWig
    log('wigToBigWig -----------------------------------------------------')

    tempFiles.push(...files)

    return Promise.all(
      files.filter(f => f !== options.sizeFile).map(file => {

        const to = toBigWigCommand(file, options)
        log(' Running:', to.command)

        return exec(to.command).then(() => to.output)
      })
    )
  })
  .then((files) => { // bigWigMerge
    log('bigWigMerge -----------------------------------------------------')

    tempFiles.push(...files)

    const output = options.bedGraph ? options.output : options.bedFile
    let merge

    if (files.length > 1) {
      merge = mergeCommand(files, output, options)
    } else {
      merge = bigWigToBedGraphCommand(files[0], output, options)
    }

    log(' Running:', merge.command)

    return exec(merge.command).then(() => merge.output)
  })
  .then((file) => { // bedGraphToBigWig
    if (options.bedGraph)
      return file

    log('bedGraphToBigWig ------------------------------------------------')

    tempFiles.push(file)

    const to = bedGraphToBigWigCommand(file, options)
    log(' Running:', to.command)

    return exec(to.command).then(() => to.output)
  })
  .then((output) => {
    log('Done ------------------------------------------------------------')
    console.log(' Output written at', output)
  })
  .catch(err =>
    console.error('Error:', err))
  .then(() =>
    Promise.all(tempFiles.map(remove)))
  .catch(err =>
    console.error('Error while removing temp files:', err))
}

function log(...args) {
  if (!defaultOptions.verbose)
    return
  console.log(...args)
}
