/*
 * boxplot.js
 */


export function getDomain(categories) {
  if (categories.length === 0)
    return [0, 10]

  let min =  Infinity
  let max = -Infinity

  categories.forEach(({ data }) => {
    if (data.min < min)
      min = data.min
    if (data.max > max)
      max = data.max
  })

  return [
    min,
    max,
  ]
}

export function combineDomains(ds) {
  let min =  Infinity
  let max = -Infinity
  ds.forEach(d => {
    if (d[0] < min)
      min = d[0]
    if (d[1] > max)
      max = d[1]
  })
  return [min, max]
}
