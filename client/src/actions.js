import { createAction } from 'redux-actions'

import queryString from './helpers/queryString.js'
import * as requests from './requests'
import * as k from './constants/ActionTypes.js'

export const setSearch   = createAction(k.SET_SEARCH)
export const setChrom    = createAction(k.SET_CHROM)
export const setPosition = createAction(k.SET_POSITION)
export const handleError = createAction(k.HANDLE_ERROR)

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
    const { ui: { chrom, position } } = getState()

    if (chrom && position) {
      dispatch(fetchSamples({ chrom, position }))
      // We create a 1s delay here to allow the first request to finish sooner
      dispatch(values.request())
      setTimeout(() => dispatch(fetchValues({ chrom, position })), 1000)
    }
  }
}

export function mergeTracks() {
  return (dispatch, getState) => {
    const { ui, samples } = getState()

    if (samples.isLoading || samples.list.length === 0)
      return

    const position = Number(ui.position)
    const start = Math.max(position - 100000, 0)
    const end   = position + 100000

    const session = {
      samples: samples.list.map(s => s.name),
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
      const state = getState()

      dispatch(actions.request())

      fn(...args)
      .then(result => dispatch(actions.receive(result)))
      .catch(err =>   dispatch(actions.error(err)))
    }
  }
}
