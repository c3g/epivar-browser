import { createAction } from 'redux-actions'

import queryString from './helpers/queryString.js'
import * as requests from './requests'
import * as k from './constants/ActionTypes.js'

export const setSearch      = createAction(k.SET_SEARCH)
export const setChrom       = createAction(k.SET_CHROM)
export const setPosition    = createAction(k.SET_POSITION)
export const setRange       = createAction(k.SET_RANGE)
export const setWindowStart = createAction(k.SET_WINDOW_START)
export const setWindowEnd   = createAction(k.SET_WINDOW_END)
export const handleError    = createAction(k.HANDLE_ERROR)

export const samples   = createFetchActions(k.SAMPLES)
export const chroms    = createFetchActions(k.CHROMS)
export const positions = createFetchActions(k.POSITIONS)
export const values    = createFetchActions(k.VALUES)

export const fetchSamples   = createFetchFunction(requests.fetchSamples, samples, 'samples')
export const fetchChroms    = createFetchFunction(requests.fetchChroms, chroms, 'chroms')
export const fetchPositions = createFetchFunction(requests.fetchPositions, positions, 'positions')
export const fetchValues    = createFetchFunction(requests.fetchValues, values, 'values')


export function changePosition(value) {
  return (dispatch, getState) => {
    const { ui: { chrom } } = getState()

    dispatch(setPosition(value))

    if (chrom)
      dispatch(fetchPositions({ chrom, start: value }))
  }
}

export function doSearch() {
  return (dispatch, getState) => {
    const { ui: { chrom, position, windowStart, windowEnd } } = getState()

    if (chrom && position) {
      dispatch(setRange(windowEnd - windowStart))
      dispatch(fetchSamples({ chrom, position }))
      // We create a 1s delay here to allow the first request to finish sooner
      dispatch(values.request())
      setTimeout(() => dispatch(fetchValues({ chrom, position, start: windowStart, end: windowEnd })), 1000)
    }
  }
}

export function mergeTracks(assay, samples) {
  return (dispatch, getState) => {
    const { ui } = getState()

    if (samples.length === 0)
      return

    // const position = Number(ui.position)
    const { windowStart, windowEnd } = ui
    const position = windowStart + Math.round((windowEnd - windowStart) / 2)

    const start = Math.max(position - Math.round(ui.range / 2), 0)
    const end   = position + Math.round(ui.range / 2)

    const session = {
      samples,
      assay,
      chrom: ui.chrom,
      position,
      start,
      end
    }

    requests.createSession(session)
    .then(sessionID => {
      const params = {
        hubClear: `${window.location.origin}${process.env.PUBLIC_URL || ''}/api/ucsc/hub/${sessionID}`,
        db: 'hg19',
        position: `${session.chrom}:${session.start}-${session.end}`,
      }
      window.open('http://ucscbrowser.genap.ca/cgi-bin/hgTracks?' + queryString(params))
    })
    .catch(err => dispatch(handleError(err)))
  }
}


function createFetchActions(namespace) {
  return {
    request: createAction(namespace.REQUEST),
    receive: createAction(namespace.RECEIVE),
    error: createAction(namespace.ERROR),
  }
}

function createFetchFunction(fn, actions, prop) {
  return function (...args) {
    return (dispatch, getState) => {

      dispatch(actions.request())

      fn(...args)
      .then(result => dispatch(actions.receive(result)))
      .catch(err =>   dispatch(actions.error(err)))
    }
  }
}
