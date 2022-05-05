import { createAction } from 'redux-actions'
import axios from 'axios'

import {queryStringFromEntries as qs} from './helpers/queryString.js'
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
export const fetchChroms    = createFetchFunction(api.fetchChroms,    chroms)
export const fetchPositions = createFetchFunction(api.fetchPositions, positions)
export const cacheValues    = createFetchFunction(api.cacheValues,    values)
export const fetchPeaks     = createFetchFunction(api.fetchPeaks,     peaks)
export const fetchUser      = createFetchFunction(api.fetchUser,      user)
export const saveUser       = createFetchFunction(api.saveUser,       user)
export const fetchMessages  = createFetchFunction(api.fetchMessages,  messages)


export const doSearch = () => (dispatch, getState) => {
  const { ui: { chrom, position } } = getState();

  if (chrom && position) {
    const query = { chrom, position };
    dispatch(fetchPeaks(query));
  }
};

export const mergeTracks = peak => dispatch => {
  const session = {...peak};

  const padding = 500;

  const featureChrom = `chr${session.feature.chrom}`;
  const snpChrom = `chr${session.snp.chrom}`;

  api.createSession(session)
    .then(sessionID => {
      const db = 'hg19';
      const snpPosition = session.snp.position;
      const displayWindow = featureChrom === snpChrom
        ? [Math.min(session.feature.start, snpPosition), Math.max(session.feature.end, snpPosition)]
        : [session.feature.start, session.feature.end];
      const position = `${featureChrom}:${displayWindow[0]-padding}-${displayWindow[1]+padding}`;
      const baseURL = `${window.location.origin}${process.env.PUBLIC_URL || ''}`;
      const hubURL = `${baseURL}/api/ucsc/hub/${sessionID}`;
      const permaHubURL = `${baseURL}/api/ucsc/perma/hub/other-tracks`;
      const ucscURL = 'https://genome.ucsc.edu/cgi-bin/hgTracks?' + qs([
        ["db", db],
        ["hubClear", hubURL],
        // ["hubClear", permaHubURL],
        ["position", position],

        // Highlight the SNP in red, and the feature in light yellow
        ["highlight", [
          `${db}.${featureChrom}:${session.feature.start}-${session.feature.end}#FFEECC`,
          `${db}.${snpChrom}:${session.snp.position}-${session.snp.position+1}#FF9F9F`,
        ].join("|")],
      ]);

      console.log('Hub:',  hubURL);
      console.log('UCSC:', ucscURL);

      window.open(ucscURL);
    })
    .catch(err => dispatch(handleError(err)));
};


// Helpers

function createFetchActions(namespace) {
  return {
    request: createAction(namespace.REQUEST, undefined),
    receive: createAction(namespace.RECEIVE, undefined),
    error: createAction(namespace.ERROR, undefined),
    abort: createAction(namespace.ABORT, undefined),
  };
}

function createFetchFunction(fn, actions) {
  return (params=undefined, meta=undefined, cancelToken=undefined) => dispatch => {
    const dispatchedAt = Date.now();
    dispatch(withMeta(actions.request(), meta));

    return fn(params, cancelToken)
      .then(result => dispatch(withMeta(actions.receive(result), meta)))
      .catch(err => {
        if (axios.isCancel(err)) {
          return dispatch(withMeta(actions.abort(err), {...(meta ?? {}), dispatchedAt}))
        } else {
          return dispatch(withMeta(actions.error(err), meta))
        }
      });
  }
}

function withMeta(action, meta) {
  if (meta) {
    action.meta = meta;
  }
  return action;
}
