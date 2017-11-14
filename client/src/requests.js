/*
 * requests.js
 */

import axios from 'axios'

import queryString from './helpers/queryString'

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

export function fetchSamples(params) {
  return fetchAPI('/samples/query', params)
}

export function fetchChroms() {
  return fetchAPI('/samples/chroms')
  .then(chroms => {
    const parse = string => +string.slice(3)
    chroms.sort((a, b) => parse(a) - parse(b))
    return chroms
  })
}

export function fetchPositions(params) {
  return fetchAPI('/samples/positions', params)
}

export function createSession(params) {
  return fetchAPI('/sessions/create', params, { method: 'post' })
}
