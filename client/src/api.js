/*
 * api.js
 */

import axios from 'axios'

import queryString from './helpers/queryString'

/*
 * API functions
 */

export function fetchAssays(params) {
  return get('/assays/list', params)
}

export function fetchPeaks(params) {
  return get('/peaks/query', params)
}

export function fetchChroms() {
  return get('/autocomplete/chroms')
  .then(chroms => {
    const parse = string => +string.slice(3)
    chroms.sort((a, b) => parse(a) - parse(b))
    return chroms
  })
}

export function fetchPositions(params, cancelToken) {
  return get('/autocomplete/positions', params, {cancelToken})
}

export const fetchAssembly = () => get('/assembly');
export const fetchConditions = () => get('/conditions');
export const fetchEthnicities = () => get('/ethnicities');

export const fetchOverviewConfig = () => get('/overview/config');
export const fetchManhattanData = ({chrom, assay}) => get(`/overview/assays/${assay}/topBinned/${chrom}`);


/**
 * @typedef ValuesOptions
 * @type {object}
 * @property {object} variant
 * @property {string} variant.chrom
 * @property {number} variant.position
 * @property {object} feature
 * @property {string} feature.chrom
 * @property {number} feature.start
 * @property {number} feature.end
 * @property {boolean} usePrecomputed
 */

/**
 * @param {ValuesOptions} params
 */
export function cacheValues(params) {
  return post(`/tracks/values?precomputed=${params.usePrecomputed ? '1' : '0'}`, params)
}

export function createSession(params) {
  return post('/sessions/create', params)
}

export function fetchUser() {
  return get('/auth/user');
}

export function saveUser(user) {
  // Only terms agreement info is actually save-able. Everything else is
  // read-only from the identity provider.
  return put('/auth/user', user);
}

export function fetchMessages() {
  return get('/messages/list');
}


// Helpers

function fetchAPI(url, params, options = {}) {
  const {method = "get", ...other} = options;

  const finalURL = process.env.PUBLIC_URL + '/api' + url + (
    (method === "get" && params) ? `?${queryString(params)}` : "");

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

function get(url, params, options) {
  return fetchAPI(url, params, options)
}

function post(url, params, options = {}) {
  return fetchAPI(url, params, { ...options, method: 'post' })
}

function put(url, params, options = {}) {
  return fetchAPI(url, params, { ...options, method: 'put' })
}
