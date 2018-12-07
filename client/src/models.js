/*
 * models.js
 */


export function createDefaultUI() {
  return {
    chrom: '',
    position: '',
    range: 200000,
    valuesWindowSize: 100,
  }
}

export function createDefaultList() {
  return {
    isLoading: false,
    list: [],
  }
}

export function createDefaultMap() {
  return {
    isLoading: false,
    map: {},
  }
}
