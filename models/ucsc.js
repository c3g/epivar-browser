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
    const trackDensity = 'pack'
    const visibility = 'on'

    Object.keys(merged.output).forEach((typeShort, i) => {
      const output = merged.output[typeShort]

      if (output === undefined)
        return

      const type = i === 0 ? 'reference' : i === 1 ? 'variant_het' : 'variant_hom'
      const trackName = `${merged.assay}__${type}`
      const shortLabel = trackName
      const longLabel = trackName

      const colors = getColor(merged.assay)

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
const COLORS = [
  [ '#5C85D6', '#2952A3' ],
  [ '#EE5430', '#B02E0E' ],
  [ '#FFAD33', '#CC7A00' ],
  [ '#13B41D', '#0D7813' ],
  [ '#B800B8', '#7A007A' ],
  [ '#5255C4', '#2F328A' ],
  [ '#00B8EE', '#007A9E' ],
  [ '#E6759B', '#C42459' ],
  [ '#7ACC00', '#528800' ],
  [ '#D04444', '#932525' ],
  [ '#3B77B3', '#274F77' ],
  [ '#B456B4', '#7A367A' ],
  [ '#29CCB8', '#1B887A' ],
  [ '#CCCC14', '#88880E' ],
  [ '#855CD6', '#5229A3' ],
  [ '#FF8A15', '#B85C00' ],
  [ '#A70808', '#6F0606' ],
  [ '#3CAF76', '#28754E' ],
  [ '#758FB8', '#445D85' ],
  [ '#5255C4', '#2F328A' ]
]

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

function getColor(string) {
  return COLORS[hash(string, COLORS.length)]
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
