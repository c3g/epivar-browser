import { createAction } from 'redux-actions'
import axios from 'axios'

import * as api from './api'
import * as k from './constants/ActionTypes.js'

// UI actions
export const setNode           = createAction(k.SET_NODE);  // TODO: need to reset user on node change
export const setChrom          = createAction(k.SET_CHROM);
export const setPosition       = createAction(k.SET_POSITION);
export const setOverviewChrom  = createAction(k.SET_OVERVIEW_CHROM);
export const setOverviewAssay  = createAction(k.SET_OVERVIEW_ASSAY);
export const setUsePrecomputed = createAction(k.SET_USE_PRECOMPUTED);
export const setDevMode        = createAction(k.SET_DEV_MODE);
export const handleError       = createAction(k.HANDLE_ERROR);

// Federated fetch actions
export const datasets          = createFetchActions(k.DATASETS);

// Dataset-specific fetch actions
export const assays            = createFetchActions(k.ASSAYS);
export const samples           = createFetchActions(k.SAMPLES);
// export const chroms            = createFetchActions(k.CHROMS);
export const positions         = createFetchActions(k.POSITIONS);
export const values            = createFetchActions(k.VALUES);
export const peaks             = createFetchActions(k.PEAKS);
// export const dataset           = createFetchActions(k.DATASET);
export const overviewConfig    = createFetchActions(k.OVERVIEW_CONFIG);
export const manhattanData     = createFetchActions(k.MANHATTAN_DATA);
export const user              = createFetchActions(k.USER);
export const messages          = createFetchActions(k.MESSAGES);

export const fetchAssays         = createFetchFunction(api.fetchAssays,         assays);
// export const fetchChroms         = createFetchFunction(api.fetchChroms,         chroms);
export const fetchPositions      = createFetchFunction(api.fetchPositions,      positions);
// export const cacheValues         = createFetchFunction(api.cacheValues,         values);
export const fetchPeaks          = createFetchFunction(api.fetchPeaks,          peaks);
export const fetchDatasets       = createFetchFunction(api.fetchDatasets,       datasets);
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

  return api.createSession(getState().ui.node, session)
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
  return (params=undefined, meta=undefined, cancelToken=undefined) => (dispatch, getState) => {
    const dispatchedAt = Date.now();

    const node = getState().ui.node;
    const fullMeta = {...(meta ?? {}), dispatchedAt, node};

    dispatch(withMeta(actions.request(), fullMeta));

    return fn(getState().ui.node, params, cancelToken)
      .then(result => dispatch(withMeta(actions.receive(result), fullMeta)))
      .catch(err => {
        if (axios.isCancel(err)) {
          return dispatch(withMeta(actions.abort(err), fullMeta));
        } else {
          return dispatch(withMeta(actions.error(err), fullMeta));
        }
      });
  };
}

function withMeta(action, meta) {
  if (meta) {
    action.meta = meta;
  }
  return action;
}
