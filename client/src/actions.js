import { createAction } from 'redux-actions'

import qs from './helpers/queryString.js'
import * as api from './api'
import * as k from './constants/ActionTypes.js'

export const setChrom       = createAction(k.SET_CHROM)
export const setPosition    = createAction(k.SET_POSITION)
export const handleError    = createAction(k.HANDLE_ERROR)

export const assays    = createFetchActions(k.ASSAYS)
export const samples   = createFetchActions(k.SAMPLES)
export const chroms    = createFetchActions(k.CHROMS)
export const positions = createFetchActions(k.POSITIONS)
export const values    = createFetchActions(k.VALUES)
export const peaks     = createFetchActions(k.PEAKS)

export const fetchAssays    = createFetchFunction(api.fetchAssays,    assays)
export const fetchSamples   = createFetchFunction(api.fetchSamples,   samples)
export const fetchChroms    = createFetchFunction(api.fetchChroms,    chroms)
export const fetchPositions = createFetchFunction(api.fetchPositions, positions)
export const fetchValues    = createFetchFunction(api.fetchValues,    values)
export const fetchPeaks     = createFetchFunction(api.fetchPeaks,     peaks)


export function doSearch() {
  return (dispatch, getState) => {
    const { ui: { chrom, position } } = getState()

    if (chrom && position) {
      const query = { chrom, position }
      dispatch(fetchPeaks(query))
    }
  }
}

export function mergeTracks(peak) {
  return (dispatch) => {

    const session = {
      ...peak,
    }

    api.createSession(session)
    .then(sessionID => {
      const position = `${session.chrom}:${session.feature.start}-${session.feature.end}`
      const baseURL = `${window.location.origin}${process.env.PUBLIC_URL || ''}`
      const hubURL = `${baseURL}/api/ucsc/hub/${sessionID}`
      const ucscURL = 'https://genome.ucsc.edu/cgi-bin/hgTracks?' + qs({ db: 'hg19', hubClear: hubURL, position })

      console.log('Hub:',  hubURL)
      console.log('UCSC:', ucscURL)

      window.open(ucscURL)
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
    return (dispatch) => {

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
