import { createAction } from 'redux-actions'
import axios from 'axios'

import * as api from './api'
import * as k from './constants/ActionTypes.js'
import {BASE_URL} from "./constants/app";
import {constructUCSCUrl} from "./helpers/ucsc";

export const setChrom          = createAction(k.SET_CHROM);
export const setPosition       = createAction(k.SET_POSITION);
export const setOverviewChrom  = createAction(k.SET_OVERVIEW_CHROM);
export const setOverviewAssay  = createAction(k.SET_OVERVIEW_ASSAY);
export const setUsePrecomputed = createAction(k.SET_USE_PRECOMPUTED);
export const setDevMode        = createAction(k.SET_DEV_MODE);
export const handleError       = createAction(k.HANDLE_ERROR);

export const assays            = createFetchActions(k.ASSAYS);
export const samples           = createFetchActions(k.SAMPLES);
export const chroms            = createFetchActions(k.CHROMS);
export const positions         = createFetchActions(k.POSITIONS);
export const values            = createFetchActions(k.VALUES);
export const peaks             = createFetchActions(k.PEAKS);
export const assembly          = createFetchActions(k.ASSEMBLY);
export const conditions        = createFetchActions(k.CONDITIONS);
export const ethnicities       = createFetchActions(k.ETHNICITIES);
export const overviewConfig    = createFetchActions(k.OVERVIEW_CONFIG);
export const manhattanData     = createFetchActions(k.MANHATTAN_DATA);
export const user              = createFetchActions(k.USER);
export const messages          = createFetchActions(k.MESSAGES);

export const fetchAssays         = createFetchFunction(api.fetchAssays,         assays);
// export const fetchChroms         = createFetchFunction(api.fetchChroms,         chroms);
export const fetchPositions      = createFetchFunction(api.fetchPositions,      positions);
// export const cacheValues         = createFetchFunction(api.cacheValues,         values);
export const fetchPeaks          = createFetchFunction(api.fetchPeaks,          peaks);
export const fetchAssembly       = createFetchFunction(api.fetchAssembly,       assembly);
export const fetchConditions     = createFetchFunction(api.fetchConditions,     conditions);
export const fetchEthnicities    = createFetchFunction(api.fetchEthnicities,    ethnicities);
export const fetchOverviewConfig = createFetchFunction(api.fetchOverviewConfig, overviewConfig);
export const fetchManhattanData  = createFetchFunction(api.fetchManhattanData,  manhattanData);
export const fetchUser           = createFetchFunction(api.fetchUser,           user);
export const saveUser            = createFetchFunction(api.saveUser,            user);
export const fetchMessages       = createFetchFunction(api.fetchMessages,       messages);


export const doSearch = () => (dispatch, getState) => {
  const { ui: { chrom, position } } = getState();

  if (chrom && position) {
    const query = { chrom, position };
    dispatch(fetchPeaks(query));
  }
};

export const mergeTracks = (peak) => (dispatch, getState) => {
  const assemblyID = getState().assembly.data?.id;

  if (!assemblyID) {
    console.error(`Could not retrieve assembly ID - got ${assemblyID}`);
    return;
  }

  const session = {...peak};

  return api.createSession(session)
    .then(sessionID => ({ assemblyID, sessionID, session }))
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
