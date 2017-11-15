export const SET_SEARCH   = 'SET_SEARCH'
export const SET_CHROM    = 'SET_CHROM'
export const SET_POSITION = 'SET_POSITION'
export const HANDLE_ERROR = 'HANDLE_ERROR'

export const SAMPLES   = createFetchConstants('SAMPLES')
export const CHROMS    = createFetchConstants('CHROMS')
export const POSITIONS = createFetchConstants('POSITIONS')
export const VALUES    = createFetchConstants('VALUES')


function createFetchConstants(namespace) {
  return {
    [`REQUEST`]: `${namespace}.REQUEST`,
    [`RECEIVE`]: `${namespace}.RECEIVE`,
    [`ERROR`]:   `${namespace}.ERROR`,
  }
}
