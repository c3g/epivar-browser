/*
 * genes.js
 */

export const normalizeGeneName = name => name.replace(/[^a-zA-Z\d]/g, '-');

export default {
  normalizeGeneName,
};
