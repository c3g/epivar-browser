/*
 * api.js
 */

import axios from 'axios'

import queryString from './helpers/queryString'

export function fetchSamples(params) {
  return get('/samples/query', params)
}

export function fetchChroms() {
  return get('/samples/chroms')
  .then(chroms => {
    const parse = string => +string.slice(3)
    chroms.sort((a, b) => parse(a) - parse(b))
    return chroms
  })
}

export function fetchPositions(params) {
  return get('/samples/positions', params)
}

export function fetchValues(params) {
  return get('/tracks/values', params)
}

export function createSession(params) {
  return post('/sessions/create', params)
}


function fetchAPI(url, params, options = {}) {
  let { method = 'get', ...other } = options

  let finalURL = process.env.PUBLIC_URL + '/api' + url
  let data = undefined

  if (method === 'post' && params)
    data = params

  if (method === 'get' && params)
    finalURL += `?${queryString(params)}`

  const config = {
    method: method,
    url: finalURL,
    data: data,
    ...other
  }

  return axios(config).then(({ data }) => {
    if (data.ok)
      return Promise.resolve(data.data)
    else
      return Promise.reject(data.message)
  })
}

function get(url, params, options) {
  return fetchAPI(url, params, options)
}

function post(url, params, options = {}) {
  return fetchAPI(url, params, { ...options, method: 'post' })
}
