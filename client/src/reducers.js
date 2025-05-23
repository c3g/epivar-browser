import { combineReducers } from "redux"

import {EPIVAR_NODES} from "./config";
import * as k from "./constants/ActionTypes"
import {makeDefaultListState, makeListReducer} from "./helpers/reducers";


const defaultChrom = 'rsID';

const defaultUI = {
  node: null,

  chrom: defaultChrom,
  position: '',

  overview: {
    chrom: '',
    assay: '',
  },

  usePrecomputed: true,

  devMode: false,
};

function uiReducer(state = defaultUI, action) {
  switch (action.type) {
    case k.SET_NODE: {
      // Reset other state too when node changes
      return { ...state, node: action.payload, chrom: defaultChrom, position: '', overview: defaultUI.overview };
    }
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
    case k.SET_USE_PRECOMPUTED: {
      return {...state, usePrecomputed: action.payload};
    }
    case k.SET_DEV_MODE: {
      return {...state, devMode: action.payload};
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
};
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

    // TODO: this can create a race condition with samples fetching
    case k.SET_NODE: {
      return defaultSamples;
    }

    default:
      return state;
  }
}

const defaultChroms = {
  isLoading: false,
  isLoaded: true,  // set to false when bringing back server-fetched genomic chromosomes - David L, 2023-05-25
  list: ['rsID', 'gene'],
}
function chromsReducer(state = defaultChroms, action) {
  switch (action.type) {
    /*
    Re-enable to bring back server-fetched genomic chromosomes. For now, this instead just holds rsID + gene.
    - David L, 2023-05-25
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
    */
    default:
      return state;
  }
}

const defaultPositions = {
  isLoading: false,
  isLoaded: false,
  lastRequestDispatched: 0,
  list: [],
};
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

    // TODO: this can create a race condition with positions fetching
    case k.SET_NODE: {
      return defaultPositions;
    }

    default:
      return state;
  }
}

const defaultPeaks = makeDefaultListState();
const peaksReducer = makeListReducer(k.PEAKS, defaultPeaks);

const defaultAssays = makeDefaultListState(
  ['RNA-seq', 'ATAC-seq', 'H3K4me1', 'H3K4me3', 'H3K27ac', 'H3K27me3']
);
const assaysReducer = makeListReducer(k.ASSAYS, defaultAssays);

// const defaultDataset = makeDefaultDataState();
const defaultDatasets = {
  datasetsByNode: {},
  isLoading: false,
  isLoaded: false,
};
const datasetsReducer = (state = defaultDatasets, action) => {
  switch (action.type) {
    // All-datasets handling
    case k.DATASETS.REQUEST: {
      return {...state, isLoading: true};
    }
    case k.DATASETS.RECEIVE: {
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        datasetsByNode: Object.fromEntries(action.payload.map((ds, i) => [EPIVAR_NODES[i], ds])),
      };
    }
    case k.DATASETS.ERROR: {
      return {...state, isLoading: false};
    }

    // Single-dataset handling
    // case k.DATASET.REQUEST: {
    //   const {datasetsByNode} = state;
    //   const {node} = action.meta;
    //   return {
    //     ...state,
    //     datasetsByNode: {
    //       ...datasetsByNode,
    //       [node]: {...defaultDataset, ...(datasetsByNode[node] ?? {}), isLoading: true},
    //     },
    //   };
    // }
    // case k.DATASET.RECEIVE: {
    //   const {datasetsByNode} = state;
    //   const {node} = action.meta;
    //   return {
    //     ...state,
    //     datasetsByNode: {
    //       ...datasetsByNode,
    //       [node]: {
    //         ...defaultDataset,
    //         ...(datasetsByNode[node] ?? {}),
    //         isLoading: false,
    //         isLoaded: true,
    //         data: action.payload,
    //       },
    //     },
    //   };
    // }
    // case k.DATASET.ERROR: {
    //   const {datasetsByNode} = state;
    //   const {node} = action.meta;
    //   return {
    //     ...state,
    //     datasetsByNode: {
    //       ...datasetsByNode,
    //       [node]: {...defaultDataset, ...(datasetsByNode[node] ?? {}), isLoading: false},
    //     },
    //   };
    // }

    default:
      return state;
  }
};

// const defaultDataset = makeDefaultDataState();
// const datasetReducer = makeDataReducer(k.DATASET, defaultDataset);

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

    // TODO: this can create a race condition with overview config loading
    case k.SET_NODE: {
      return defaultOverview;
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

    // TODO: this can create a race condition with manhattan data loading
    case k.SET_NODE: {
      return defaultManhattan;
    }

    default:
      return state;
  }
};

const defaultUser = {
  isLoading: false,
  isLoaded: false,
  data: null,
};
const userReducer = (state = defaultUser, action) => {
  switch (action.type) {
    case k.USER.REQUEST:
      return {...state, isLoading: true};
    case k.USER.RECEIVE:
      return {...state, isLoading: false, isLoaded: true, data: action.payload};
    case k.USER.ERROR:
      return {...state, isLoading: false};

    // TODO: this can create a race condition with user fetching
    case k.SET_NODE: {
      return defaultUser;
    }

    default:
      return state;
  }
};


const defaultMessages = makeDefaultListState();
const messagesReducer = makeListReducer(k.MESSAGES, defaultMessages);


export const rootReducer = combineReducers({
  ui: uiReducer,

  chroms: chromsReducer,
  positions: positionsReducer,

  datasets: datasetsReducer,

  assays: assaysReducer,
  samples: samplesReducer,
  peaks: peaksReducer,

  overview: overviewReducer,
  manhattan: manhattanReducer,

  user: userReducer,
  messages: messagesReducer,
});
