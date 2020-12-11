import { combineReducers } from 'redux'
import * as k from './constants/ActionTypes.js'
import { createDefaultUI, createDefaultList, createDefaultMap } from './models'


function uiReducer(state = createDefaultUI(), action, data) {
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
    case k.SET_WINDOW_START: {
      return { ...state, windowStart: action.payload }
    }
    case k.SET_WINDOW_END: {
      return { ...state, windowEnd: action.payload }
    }
    default:
      return state;
  }
}

const defaultSamples = {
  isLoading: false,
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
      return { ...state, isLoading: false, stats: action.payload }
    }
    case k.SAMPLES.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

function chromsReducer(state = createDefaultList(), action) {
  switch (action.type) {
    case k.CHROMS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.CHROMS.RECEIVE: {
      return { ...state, isLoading: false, list: action.payload }
    }
    case k.CHROMS.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

function positionsReducer(state = createDefaultList(), action) {
  switch (action.type) {
    case k.POSITIONS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.POSITIONS.RECEIVE: {
      return { ...state, isLoading: false, list: action.payload }
    }
    case k.POSITIONS.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

function valuesReducer(state = createDefaultMap(), action) {
  switch (action.type) {
    case k.VALUES.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.VALUES.RECEIVE: {
      return { ...state, isLoading: false, map: action.payload }
    }
    case k.VALUES.ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

function peaksReducer(state = createDefaultList(), action) {
  switch (action.type) {
    case k.PEAKS.REQUEST: {
      return { ...state, isLoading: true }
    }
    case k.PEAKS.RECEIVE: {
      return { ...state, isLoading: false, map: action.payload }
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
