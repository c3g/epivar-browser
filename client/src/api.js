/*
 * api.js
 */

import axios from 'axios'

import queryString from './helpers/queryString'

/*
 * API functions
 */

export function fetchAssays(node, params) {
  return get(node, '/assays/list', params)
}

export function fetchPeaks(node, params) {
  return get(node, '/peaks/query', params)
}

export function fetchPositions(node, params, cancelToken) {
  return get(node, '/autocomplete/positions', params, {cancelToken})
}

export const fetchAssembly = (node) => get(node, '/assembly');
export const fetchConditions = (node) => get(node, '/conditions');
export const fetchEthnicities = (node) => get(node, '/ethnicities');

export const fetchOverviewConfig = (node) => get(node, '/overview/config');
export const fetchManhattanData = (node, {chrom, assay}) => get(node, `/overview/assays/${assay}/topBinned/${chrom}`);


export function createSession(node, params) {
  return post(node, '/sessions/create', params)
}

export function fetchUser(node) {
  return get(node, '/auth/user');
}

export function saveUser(node, user) {
  // Only terms agreement info is actually save-able. Everything else is
  // read-only from the identity provider.
  return put(node, '/auth/user', user);
}

export function fetchMessages(node) {
  return get(node, '/messages/list');
}


// Helpers

function fetchAPI(node, url, params, options = {}) {
  const {method = "get", ...other} = options;

  const finalURL = `${node}/api${url}${(method === "get" && params) ? `?${queryString(params)}` : ""}`;

  const data = (["patch", "post", "put"].includes(method) && params)
    ? params
    : undefined;

  const config = {
    method,
    url: finalURL,
    data,
    withCredentials: true,
    ...other,
  };

  return axios(config).then(({ data }) => (
    data.ok
      ? Promise.resolve(data.data)
      : Promise.reject(new Error(data.message))
  ));
}

function get(node, url, params, options) {
  return fetchAPI(node, url, params, options)
}

function post(node, url, params, options = {}) {
  return fetchAPI(node, url, params, { ...options, method: 'post' })
}

function put(node, url, params, options = {}) {
  return fetchAPI(node, url, params, { ...options, method: 'put' })
}
