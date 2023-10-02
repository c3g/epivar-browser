const LS_HAS_LOGGED_IN_BEFORE = 'EPIVAR_HAS_LOGGED_IN_BEFORE';

export const setHasLoggedIn = () => {
  localStorage.setItem(LS_HAS_LOGGED_IN_BEFORE, "1");
}

export const getHasLoggedIn = () => {
  return localStorage.getItem(LS_HAS_LOGGED_IN_BEFORE) === "1";
}
