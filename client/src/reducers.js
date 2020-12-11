import { combineReducers } from 'redux'
import { set, merge } from 'object-path-immutable'
import * as k from './constants/ActionTypes'


const defaultUI = {
  chrom: 'chr11',
  position: '70310555',
  range: 200000,
  windowStart: 0,
  windowEnd: 100,
}
function uiReducer(state = defaultUI, action, data) {
  switch (action.type) {
    case k.SET_SEARCH: {
      return { ...state, search: action.payload }
    }
    case k.SET_CHROM: {
      return { ...state, chrom: action.payload }
    }
    case k.SET_POSITION: {
      return { ...state, position: action.payload }
    }
    case k.SET_RANGE: {
      return { ...state, range: action.payload }
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
  list: [],
}
function chromsReducer(state = defaultChroms, action) {
  switch (action.type) {
    case k.CHROMS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.CHROMS.RECEIVE: {
      return { ...state, isLoading: false, isLoaded: true, list: action.payload }
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
  total: 0,
  list: [],
}
function positionsReducer(state = defaultPositions, action) {
  switch (action.type) {
    case k.POSITIONS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.POSITIONS.RECEIVE: {
      return { ...state, isLoading: false, isLoaded: true, list: action.payload }
    }
    case k.POSITIONS.ERROR: {
      return { ...state, isLoading: false }
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
      return merge(state, ['itemsByID', action.meta.id], { isLoading: true, isLoaded: false, message: undefined, })
    }
    case k.VALUES.RECEIVE: {
      return merge(state, ['itemsByID', action.meta.id], { isLoading: false, isLoaded: true, ...action.payload })
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
      return { ...state, isLoading: true }
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

export const rootReducer = combineReducers({
  ui: uiReducer,
  samples: samplesReducer,
  chroms: chromsReducer,
  positions: positionsReducer,
  values: valuesReducer,
  peaks: peaksReducer,
})
