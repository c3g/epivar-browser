import { combineReducers } from 'redux'
import { merge } from 'object-path-immutable'
import * as k from './constants/ActionTypes'


const defaultChrom = 'rsID'

const defaultUI =
  process.env.NODE_ENV === 'production' ?
    { chrom: defaultChrom, position: '' } :
    { chrom: defaultChrom, position: '' }

function uiReducer(state = defaultUI, action) {
  switch (action.type) {
    case k.SET_CHROM: {
      return { ...state, chrom: action.payload }
    }
    case k.SET_POSITION: {
      return { ...state, position: action.payload }
    }
    default:
      return state;
  }
}

const defaultSamples = {
  isLoading: false,
  isLoaded: false,
  stats: {
    total: 0,
    counts: {},
    chrom: undefined,
    start: undefined,
    end: undefined,
    ref: undefined,
  }
}
function samplesReducer(state = defaultSamples, action) {
  switch (action.type) {
    case k.SAMPLES.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.SAMPLES.RECEIVE: {
      return { ...state, isLoading: false, isLoaded: true, stats: action.payload }
    }
    case k.SAMPLES.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

const defaultChroms = {
  isLoading: false,
  isLoaded: false,
  total: 0,
  list: ['rsID', 'gene'],
}
function chromsReducer(state = defaultChroms, action) {
  switch (action.type) {
    case k.CHROMS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.CHROMS.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        list: state.list.concat(action.payload)
      }
    }
    case k.CHROMS.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

const defaultPositions = {
  isLoading: false,
  isLoaded: false,
  lastRequestDispatched: 0,
  total: 0,
  list: [],
}
function positionsReducer(state = defaultPositions, action) {
  switch (action.type) {
    case k.POSITIONS.REQUEST: {
      return { ...state, isLoading: true, lastRequestDispatched: Date.now() }
    }
    case k.POSITIONS.RECEIVE: {
      return { ...state, isLoading: false, isLoaded: true, list: action.payload }
    }
    case k.POSITIONS.ERROR: {
      return { ...state, isLoading: false }
    }
    case k.POSITIONS.ABORT: {
      // If the last request was dispatched before or concurrent with the cancellation, set loading to false
      // Otherwise, leave loading state as-is
      // TODO: Should this use cancel token?
      return {...state, isLoading: action.meta.dispatchedAt >= state.lastRequestDispatched ? false : state.isLoading}
    }
    default:
      return state;
  }
}

const defaultValues = {
  isLoading: false,
  isLoaded: false,
  itemsByID: {},
}
function valuesReducer(state = defaultValues, action) {
  switch (action.type) {
    case k.VALUES.REQUEST: {
      return merge(state, ['itemsByID', action.meta.id], { isLoading: true, isLoaded: false, data: {}, message: undefined, })
    }
    case k.VALUES.RECEIVE: {
      return merge(state, ['itemsByID', action.meta.id], { isLoading: false, isLoaded: true, data: action.payload })
    }
    case k.VALUES.ERROR: {
      return merge(state, ['itemsByID', action.meta.id], { isLoading: false, message: action.payload.message })
    }
    default:
      return state;
  }
}

const defaultPeaks = {
  isLoading: false,
  isLoaded: false,
  total: 0,
  list: [],
}
function peaksReducer(state = defaultPeaks, action) {
  switch (action.type) {
    case k.PEAKS.REQUEST: {
      return { ...state, isLoading: true, isLoaded: false, list: [] }
    }
    case k.PEAKS.RECEIVE: {
      return { ...state, isLoading: false, isLoaded: true, list: action.payload }
    }
    case k.PEAKS.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

const defaultAssays = {
  isLoading: false,
  isLoaded: false,
  total: 0,
  list: ['RNA-seq', 'ATAC-seq', 'H3K4me1', 'H3K4me3', 'H3K27ac', 'H3K27me3'],
}
function assaysReducer(state = defaultAssays, action) {
  switch (action.type) {
    case k.ASSAYS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.ASSAYS.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        list: action.payload
      }
    }
    case k.ASSAYS.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

export const rootReducer = combineReducers({
  ui: uiReducer,
  samples: samplesReducer,
  chroms: chromsReducer,
  positions: positionsReducer,
  values: valuesReducer,
  peaks: peaksReducer,
  assays: assaysReducer,
})
