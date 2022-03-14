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

export function fetchSamples(params) {
  return get('/samples/query', params)
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
 */

/**
 * @param {ValuesOptions} params
 */
export function cacheValues(params) {
  return post('/tracks/values', params)
}

export function createSession(params) {
  return post('/sessions/create', params)
}

export function fetchUser() {
  return get('/auth/user');
}

export function fetchMessages() {
  return get('/messages/list');
}


// Helpers

function fetchAPI(url, params, options = {}) {
  let { method = 'get', ...other } = options;

  const finalURL = process.env.PUBLIC_URL + '/api' + url + (
    (method === 'get' && params) ? `?${queryString(params)}` : "");

  const data = (method === 'post' && params)
    ? params
    : undefined;

  const config = {
    method,
    url: finalURL,
    data,
    withCredentials: true,
    ...other,
  };

  return axios(config).then(({ data }) => {
    if (data.ok) {
      return Promise.resolve(data.data);
    } else {
      return Promise.reject(new Error(data.message));
    }
  });
}

function get(url, params, options) {
  return fetchAPI(url, params, options)
}

function post(url, params, options = {}) {
  return fetchAPI(url, params, { ...options, method: 'post' })
}
