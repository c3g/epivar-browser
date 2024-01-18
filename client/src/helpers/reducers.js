import * as k from "../constants/ActionTypes"

export const makeDefaultListState = (defaultList = undefined) => ({
  isLoading: false,
  isLoaded: false,
  list: defaultList ?? [],
});

export const makeListReducer = (types, defaultState) => (state = defaultState, action) => {
  switch (action.type) {
    case types.REQUEST:
      return {...state, isLoading: true, isLoaded: false, list: []};
    case types.RECEIVE:
      return {...state, isLoading: false, isLoaded: true, list: action.payload};
    case types.ERROR:
      return {...state, isLoading: false};

    // TODO: this can create a race condition with fetching
    case k.SET_NODE:
      return defaultState;

    default:
      return state;
  }
};
