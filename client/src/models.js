/*
 * models.js
 */


export function createDefaultUI() {
  return {
    chrom: '',
    position: '',
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
