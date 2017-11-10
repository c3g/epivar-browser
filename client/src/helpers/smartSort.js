/*
 * smartSort.js
 */


export default function smartSort(a, b) {
  const ta = typeof a
  const tb = typeof b

  if (ta === 'number' && tb === 'number')
    return b - a

  if (ta === 'string' && tb === 'string')
    return b.localeCompare(a)

  if (a instanceof Date && b instanceof Date)
    return b - a

  return b - a
}

export function reverse(a, b) {
  return -smartSort(a, b)
}
