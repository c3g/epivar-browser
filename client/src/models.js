/*
 * models.js
 */

const { keys, values } = Object


export function createDefaultUI() {
  return {
    search: '',
  }
}

export function createDefaultSamples() {
  return {
    isLoading: false,
    list: [],
  }
}
