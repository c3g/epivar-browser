export default function queryString(params) {
  return Object.entries(params)
    .filter(([_key, value]) => value !== undefined)
    .map(([key, value]) =>
      `${encodeURIComponent(key)}=${encodeURIComponent(asString(value))}`)
    .join('&');
}

function asString(value) {
  if (value === null)
    return 'null'
  if (typeof value === 'object')
    return JSON.stringify(value)
  return value.toString()
}
