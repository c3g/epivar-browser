/*
 * genes.js
 */

export const normalizeGeneName = (name) => {
  return name.replace(/[^a-zA-Z\d]/g, '-');
};

export default {
  normalizeGeneName,
};
