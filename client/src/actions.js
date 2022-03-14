import { createAction } from 'redux-actions'
import axios from 'axios'

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
export const user      = createFetchActions(k.USER)
export const messages  = createFetchActions(k.MESSAGES)

export const fetchAssays    = createFetchFunction(api.fetchAssays,    assays)
export const fetchSamples   = createFetchFunction(api.fetchSamples,   samples)
export const fetchChroms    = createFetchFunction(api.fetchChroms,    chroms)
export const fetchPositions = createFetchFunction(api.fetchPositions, positions)
export const cacheValues    = createFetchFunction(api.cacheValues,    values)
export const fetchPeaks     = createFetchFunction(api.fetchPeaks,     peaks)
export const fetchUser      = createFetchFunction(api.fetchUser,      user)
export const fetchMessages  = createFetchFunction(api.fetchMessages,  messages)


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
        const db = 'hg19'
        const position = `${session.chrom}:${session.feature.start}-${session.feature.end}`
        const baseURL = `${window.location.origin}${process.env.PUBLIC_URL || ''}`
        const hubURL = `${baseURL}/api/ucsc/hub/${sessionID}`
        const ucscURL = 'https://genome.ucsc.edu/cgi-bin/hgTracks?' + qs({
          db,
          hubClear: hubURL,
          position,
          highlight: `${db}.${session.chrom}:${session.position}-${session.position+1}#FFAAAA`,
        })

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
    abort: createAction(namespace.ABORT, undefined),
  }
}

function createFetchFunction(fn, actions) {
  return function (params=undefined, meta=undefined, cancelToken=undefined) {
    return (dispatch) => {

      const dispatchedAt = Date.now()
      dispatch(withMeta(actions.request(), meta))

      return fn(params, cancelToken)
        .then(result => dispatch(withMeta(actions.receive(result), meta)))
        .catch(err => {
          if (axios.isCancel(err)) {
            return dispatch(withMeta(actions.abort(err), {...(meta ?? {}), dispatchedAt}))
          } else {
            return dispatch(withMeta(actions.error(err), meta))
          }
        })
    }
  }
}

function withMeta(action, meta) {
  if (meta)
    action.meta = meta
  return action
}
