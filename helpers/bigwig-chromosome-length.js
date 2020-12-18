/*
 * bigwig-chromosome-length.js
 */

const { BigWig } = require('@gmod/bbi')

module.exports = bigWigChromosomeLength

async function bigWigChromosomeLength(path, chrom) {
  const file = new BigWig({ path })
  const header = await file.getHeader()
  const refIndex = header.refsByName[chrom]
  if (refIndex === undefined)
    throw new Error(`Chromosome ${chrom} not found in ${path} (values: ${Object.keys(header.refsByName).join(', ')})`)
  const ref = header.refsByNumber[refIndex]
  return ref.length
}
