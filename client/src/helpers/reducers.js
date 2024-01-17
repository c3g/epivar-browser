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
    default:
      return state;
  }
};

export const makeDefaultDataState = (defaultData = undefined) => ({
  isLoading: false,
  isLoaded: false,
  data: defaultData,
});
