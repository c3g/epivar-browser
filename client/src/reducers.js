import { combineReducers } from 'redux'
import * as k from './constants/ActionTypes'


const defaultChrom = 'rsID'

const defaultUI = {
  chrom: defaultChrom,
  position: '',

  overview: {
    chrom: '',
    assay: '',
  },
};

function uiReducer(state = defaultUI, action) {
  switch (action.type) {
    case k.SET_CHROM: {
      return { ...state, chrom: action.payload };
    }
    case k.SET_POSITION: {
      return { ...state, position: action.payload };
    }
    case k.SET_OVERVIEW_CHROM: {
      return {...state, overview: {...state.overview, chrom: action.payload}};
    }
    case k.SET_OVERVIEW_ASSAY: {
      return {...state, overview: {...state.overview, assay: action.payload}};
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

const defaultPeaks = {
  isLoading: false,
  isLoaded: false,
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

const defaultOverview = {
  isLoading: false,
  isLoaded: false,
  config: {},
};
const overviewReducer = (state = defaultOverview, action) => {
  switch (action.type) {
    case k.OVERVIEW_CONFIG.REQUEST: {
      return {...state, isLoading: true};
    }
    case k.OVERVIEW_CONFIG.RECEIVE: {
      return {...state, isLoading: false, isLoaded: true, config: action.payload};
    }
    case k.OVERVIEW_CONFIG.ERROR: {
      return {...state, isLoading: false};
    }
    default:
      return state;
  }
};

const defaultManhattan = {
  byChromAndAssay: {},
};
const manhattanReducer = (state = defaultManhattan, action) => {
  switch (action.type) {
    case k.MANHATTAN_DATA.REQUEST: {
      const {chrom, assay} = action.meta;
      const chromData = state.byChromAndAssay[chrom] ?? {};
      return {
        ...state,
        byChromAndAssay: {
          ...state.byChromAndAssay,
          [chrom]: {
            ...chromData,
            [assay]: {...chromData[assay] ?? {}, isLoading: true, isLoaded: false, data: []},
          },
        },
      };
    }

    case k.MANHATTAN_DATA.RECEIVE: {
      const {chrom, assay} = action.meta;
      const chromData = state.byChromAndAssay[chrom] ?? {};
      return {
        ...state,
        byChromAndAssay: {
          ...state.byChromAndAssay,
          [chrom]: {
            ...chromData,
            [assay]: {...chromData[assay] ?? {}, isLoading: false, isLoaded: true, data: action.payload},
          },
        },
      };
    }

    case k.MANHATTAN_DATA.ERROR: {
      const {chrom, assay} = action.meta;
      const chromData = state.byChromAndAssay[chrom] ?? {};
      return {
        ...state,
        byChromAndAssay: {
          ...state.byChromAndAssay,
          [chrom]: {
            ...chromData,
            [assay]: {...chromData[assay] ?? {}, isLoading: false},
          },
        },
      };
    }

    default:
      return state;
  }
};

const defaultUser = {
  isLoading: false,
  isLoaded: false,
  data: undefined,
};
function userReducer(state = defaultUser, action) {
  switch (action.type) {
    case k.USER.REQUEST: {
      return {...state, isLoading: true};
    }
    case k.USER.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        data: action.payload,
      };
    }
    case k.USER.ERROR: {
      return {...state, isLoading: false};
    }
    default:
      return state;
  }
}

const defaultMessages = {
  isLoading: false,
  isLoaded: false,
  total: 0,
  list: [],
};
function messagesReducer(state = defaultMessages, action) {
  switch (action.type) {
    case k.MESSAGES.REQUEST: {
      return {...state, isLoading: true};
    }
    case k.MESSAGES.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        list: action.payload,
      };
    }
    case k.MESSAGES.ERROR: {
      return {...state, isLoading: false};
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
  peaks: peaksReducer,
  assays: assaysReducer,

  overview: overviewReducer,
  manhattan: manhattanReducer,

  user: userReducer,
  messages: messagesReducer,
});
