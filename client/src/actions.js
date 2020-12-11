import { createAction } from 'redux-actions'

import queryString from './helpers/queryString.js'
import * as api from './api'
import * as k from './constants/ActionTypes.js'

export const setSearch      = createAction(k.SET_SEARCH)
export const setChrom       = createAction(k.SET_CHROM)
export const setPosition    = createAction(k.SET_POSITION)
export const setRange       = createAction(k.SET_RANGE)
export const handleError    = createAction(k.HANDLE_ERROR)

export const samples   = createFetchActions(k.SAMPLES)
export const chroms    = createFetchActions(k.CHROMS)
export const positions = createFetchActions(k.POSITIONS)
export const values    = createFetchActions(k.VALUES)
export const peaks     = createFetchActions(k.PEAKS)

export const fetchSamples   = createFetchFunction(api.fetchSamples,   samples)
export const fetchChroms    = createFetchFunction(api.fetchChroms,    chroms)
export const fetchPositions = createFetchFunction(api.fetchPositions, positions)
export const fetchValues    = createFetchFunction(api.fetchValues,    values)
export const fetchPeaks     = createFetchFunction(api.fetchPeaks,     peaks)


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
    const { ui: { chrom, position } } = getState()

    if (chrom && position) {
      const query = { chrom, position }
      dispatch(fetchPeaks(query))
    }
  }
}

export function mergeTracks(assay) {
  return (dispatch, getState) => {
    const { ui } = getState()

    const position = Number(ui.position)
    const { windowStart, windowEnd } = ui
    const windowCenter = windowStart + Math.round((windowEnd - windowStart) / 2)

    const start = Math.max(windowCenter - Math.round(ui.range / 2), 0)
    const end   = windowCenter + Math.round(ui.range / 2)

    const session = {
      assay,
      chrom: ui.chrom,
      position,
      start,
      end
    }

    api.createSession(session)
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


// Helpers

function createFetchActions(namespace) {
  return {
    request: createAction(namespace.REQUEST, undefined),
    receive: createAction(namespace.RECEIVE, undefined),
    error: createAction(namespace.ERROR, undefined),
  }
}

function createFetchFunction(fn, actions) {
  return function (params, meta) {
    return (dispatch, getState) => {

      dispatch(withMeta(actions.request(), meta))

      fn(params)
      .then(result => dispatch(withMeta(actions.receive(result), meta)))
      .catch(err =>   dispatch(withMeta(actions.error(err), meta)))
    }
  }
}

function withMeta(action, meta) {
  if (meta)
    action.meta = meta
  return action
}
