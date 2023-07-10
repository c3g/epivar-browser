const LS_POST_AUTH_PATH = 'EPIVAR_POST_AUTH_PATH';

export const setPostAuthPath = (path) => {
  localStorage.setItem(LS_POST_AUTH_PATH, path);
};

export const popPostAuthPath = () => {
  const res = localStorage.getItem(LS_POST_AUTH_PATH);
  localStorage.removeItem(LS_POST_AUTH_PATH);
  return res;
};
