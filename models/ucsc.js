/*
 * ucsc.js
 */


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
        color ${getColor(merged.assay)}
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
          color 0,0,0
        `))
    })

  })

  return trackBlocks.join('\n\n')
}

// Thanks to Google Charts
const COLORS = [
  '51,102,204',
  '220,57,18',
  '255,153,0',
  '16,150,24',
  '153,0,153',
  '59,62,172',
  '0,153,198',
  '221,68,119',
  '102,170,0',
  '184,46,46',
  '49,99,149',
  '153,68,153',
  '34,170,153',
  '170,170,17',
  '102,51,204',
  '230,115,0',
  '139,7,7',
  '50,146,98',
  '85,116,166',
  '59,62,172'
]

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
