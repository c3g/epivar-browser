const LS_HAS_LOGGED_IN_BEFORE = "EPIVAR_HAS_LOGGED_IN_BEFORE";

const getLoggedInObject = () => JSON.parse(localStorage.getItem(LS_HAS_LOGGED_IN_BEFORE) || "{}");

export const setHasLoggedIn = (node) => {
  const existing = getLoggedInObject();
  localStorage.setItem(LS_HAS_LOGGED_IN_BEFORE, JSON.stringify({...existing, [node]: true}));
}

export const getHasLoggedIn = (node) => (getLoggedInObject()[node]) ?? false;
