/*
 * boxplot.js
 */


export function getDomain(categories) {
  if (categories.length === 0) {
    return undefined;
  }

  let min =  Infinity;
  let max = -Infinity;

  categories.forEach(({ data }) => {
    if (data.stats.min < min)
      min = data.stats.min
    if (data.stats.max > max)
      max = data.stats.max
  });

  return [
    min,
    max,
  ];
}

export function combineDomains(ds) {
  const fds = ds.filter(Boolean)
  if (fds.length === 0)
    return [0, 10]
  let min =  Infinity
  let max = -Infinity
  fds.forEach(d => {
    if (d[0] < min)
      min = d[0]
    if (d[1] > max)
      max = d[1]
  })
  return [min, max]
}
