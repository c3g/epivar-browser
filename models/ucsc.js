/*
 * ucsc.js
 */

const Color = require('color-js')

module.exports = {
  generateHub,
  generateGenome,
  generateTracks,
}

function generateHub(session) {
  return unindent`
    hub DIGV_Hub
    shortLabel DIG Viewer Dynamic Track Hub (Session ID: ${session})
    longLabel DIG Viewer Dynamic Track Hub (Session ID: ${session})
    genomesFile ../genome/${session}
    email info@epigenomesportal.ca
  `
}

function generateGenome(session, assembly) {
  return unindent`
    genome ${assembly}
    trackDb ../track-db/${session}
  `
}

function generateTracks(mergedTracks) {

  const trackBlocks = []

  mergedTracks.forEach(merged => {

    const trackType = 'bigWig'

    const types = Object.keys(merged.output)
    const typesWithDataLength = Object.values(merged.output).filter(Boolean).length

    if (typesWithDataLength > 1) {
      const parentName = `${merged.assay}__averages`
      const shortLabel = parentName
      const longLabel = parentName

      trackBlocks.push(unindent`
        track ${parentName}
        container multiWig
        shortLabel ${shortLabel}
        longLabel ${longLabel}
        type bigWig
        visibility full
        aggregate transparentOverlay
        showSubtrackColorOnUi on
        windowingFunction maximum
        priority 1.2
        configurable on
        dragAndDrop subTracks
        autoScale on
      `)

      types.forEach(type => {
        const output = merged.output[type]

        if (output === undefined)
          return

        const trackName = `${parentName}__${type}`
        const shortLabel = trackName

        const colors = getColor(type)

        trackBlocks.push(indent(4, unindent`
          track ${trackName}
          type ${trackType}
          parent ${parentName}
          shortLabel ${shortLabel}
          bigDataUrl ${output.url}
          maxHeightPixels 25:25:8
          color ${colors[0]}
          graphTypeDefault points
        `))
      })
    }

    types.forEach((typeShort, i) => {
      const output = merged.output[typeShort]

      if (output === undefined)
        return

      const type = typeShort === 'REF' ? 'reference' : typeShort === 'HET' ? 'variant_het' : 'variant_hom'
      const trackName = `${merged.assay}__${type}`
      const shortLabel = trackName
      const longLabel = trackName

      const colors = getColor(typeShort)

      trackBlocks.push(unindent`
        track ${trackName}
        container multiWig
        shortLabel ${shortLabel}
        longLabel ${longLabel}
        type bigWig
        visibility full
        aggregate transparentOverlay
        showSubtrackColorOnUi on
        windowingFunction maximum
        priority 1.2
        configurable on
        dragAndDrop subTracks
        autoScale on
      `)

      trackBlocks.push(indent(4, unindent`
        track ${trackName}__data
        type ${trackType}
        parent ${trackName}
        shortLabel ${shortLabel}__data
        longLabel ${longLabel}__data
        bigDataUrl ${output.url}
        maxHeightPixels 25:25:8
        color ${colors[0]}
      `))

      if (output.hasDeviation)
        trackBlocks.push(indent(4, unindent`
          track ${trackName}__deviation
          type ${trackType}
          parent ${trackName}
          shortLabel ${shortLabel}__deviation
          longLabel ${longLabel}__deviation
          bigDataUrl ${output.url.replace(/\.bw$/, '-dev.bw')}
          maxHeightPixels 25:25:8
          color ${colors[1]}
        `))
    })

  })

  return trackBlocks.join('\n\n')
}

// Thanks to Google Charts
const COLORS = {
  REF: [
    '#87A8E8',
    '#3559A1'
  ],
  HET: [
    '#FFAD33',
    '#B77C25'
  ],
  HOM: [
    '#E038E0',
    '#910591'
  ],
}
/* const COLORS = {
 *   REF: [ '#5C85D6', '#EE5430' ],
 *   HET: [ '#FFAD33', '#13B41D' ],
 *   HOM: [ '#B800B8', '#29CCB8' ],
 * } */

/* Original colors:
 * [
 *   '#3366CC',
 *   '#DC3912',
 *   '#FF9900',
 *   '#109618',
 *   '#990099',
 *   '#3B3EAC',
 *   '#0099C6',
 *   '#DD4477',
 *   '#66AA00',
 *   '#B82E2E',
 *   '#316395',
 *   '#994499',
 *   '#22AA99',
 *   '#AAAA11',
 *   '#6633CC',
 *   '#E67300',
 *   '#8B0707',
 *   '#329262',
 *   '#5574A6',
 *   '#3B3EAC'
 * ] */

function getColor(type) {
  return COLORS[type].map(colorToRGB)
}

function colorToRGB(c) {
  const color = Color(c)
  const r = Math.floor(color.getRed() * 255)
  const g = Math.floor(color.getGreen() * 255)
  const b = Math.floor(color.getBlue() * 255)
  return [r, g, b].join(',')
}

function hash(string, mod) {
  return [].slice.call(string).map(s => s.charCodeAt(0)).reduce((acc, cur) => acc + cur, 0) % mod
}

function unindent(strings, ...args) {
  let result = ''
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]
    if (i < args.length)
      result += args[i]
  }
  return result.replace(/^\s+/mg, '').replace(/\n+$/, '')
}

function indent(n, string) {
  return string.replace(/^/mg, ' '.repeat(n))
}
