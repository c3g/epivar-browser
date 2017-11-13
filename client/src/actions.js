import { createAction } from 'redux-actions'

import queryString from './helpers/queryString.js'
import parseLocation from './helpers/parseLocation.js'
import * as requests from './requests'
import * as k from './constants/ActionTypes.js'


export const setSearch = createAction(k.SET_SEARCH)

export const requestSamples = createAction(k.REQUEST_SAMPLES)
export const receiveSamples = createAction(k.RECEIVE_SAMPLES)
export const receiveError   = createAction(k.RECEIVE_ERROR)

export function fetchSamples(options) {
  return (dispatch, getState) => {
    const { samples } = getState()

    if (samples.isLoading)
      return

    dispatch(requestSamples())

    requests.fetchSamples(options)
    .then(samples => dispatch(receiveSamples(samples)))
    .catch(err => dispatch(receiveError(err)))
  }
}

export function mergeTracks() {
  return (dispatch, getState) => {
    const { ui, samples } = getState()

    if (samples.isLoading || samples.list.length === 0)
      return

    const session = parseLocation(ui.search)
    session.samples = samples.list.map(s => s.name)

    requests.createSession(session)
    .then(session => {
      const params = {
        hubClear: `${window.location.origin}${process.env.PUBLIC_URL || ''}/api/ucsc/hub/${session}`,
        db: 'hg19',
      }
      window.open('http://ucscbrowser.genap.ca/cgi-bin/hgTracks?' + queryString(params))
    })
    .catch(err => dispatch(receiveError(err)))
  }
}
