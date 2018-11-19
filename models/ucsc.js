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
  const compositeTrackBlocks = []

  mergedTracks.forEach(merged => {

    const parentName = merged.assay
    const trackType = 'bigWig'
    const trackDensity = 'pack'
    const visibility = 'on'
    const shortLabel = merged.assay
    const longLabel = merged.assay

    compositeTrackBlocks.push(unindent`
      track ${parentName}
      compositeTrack on
      shortLabel ${parentName}
      longLabel ${parentName}
      dragAndDrop subTracks
      priority 1
      type bed 5
      visibility pack
      color ${getColor(parentName)}
    `)

    Object.keys(merged.output).forEach((typeShort, i) => {
      const output = merged.output[typeShort]

      if (output === undefined)
        return

      const type = i === 0 ? 'reference' : i === 1 ? 'variant_het' : 'variant_hom'
      const trackName = `${parentName}__${type}`
      const shortLabel = trackName
      const longLabel = trackName

      trackBlocks.push(unindent`
        track ${trackName}
        type ${trackType}
        parent ${parentName} ${visibility}
        shortLabel ${shortLabel}
        longLabel ${longLabel}
        visibility ${trackDensity}
        bigDataUrl ${output.url}
        maxHeightPixels 25:25:8
        autoScale on
      `)
    })

  })

  return (
      compositeTrackBlocks.join('\n\n')
    + '\n\n'
    + trackBlocks.map(block => indent(4, block)).join('\n    \n')
  )
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
