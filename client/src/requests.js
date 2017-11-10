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
  return fetchAPI('/samples', params)
}

export function createSession(samples) {
  return fetchAPI('/sessions/create', samples, { method: 'post' })
}
