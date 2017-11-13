import * as k from './constants/ActionTypes.js';
import { createDefaultUI, createDefaultSamples } from './models';


function uiReducer(state = createDefaultUI(), action, data) {
  switch (action.type) {
    case k.SET_SEARCH: {
      return { ...state, search: action.payload }
    }
    default:
      return state;
  }
}

function samplesReducer(state = createDefaultSamples(), action, ui) {
  switch (action.type) {
    case k.REQUEST_SAMPLES: {
      return { ...state, isLoading: true }
    }
    case k.RECEIVE_SAMPLES: {
      return { ...state, isLoading: false, list: action.payload }
    }
    case k.RECEIVE_ERROR: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}

export const rootReducer = (state = {}, action) => {
  const samples = samplesReducer(state.samples, action)
  const ui = uiReducer(state.ui, action)

  return { ui, samples }
}
