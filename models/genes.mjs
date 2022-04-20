/*
 * genes.js
 */

import {findOne} from "./db.mjs";

export const normalizeName = name => name.replace(/[^a-zA-Z\d]/g, '-');
export const findByName = name =>
  findOne(
    `SELECT * FROM genes WHERE name_norm = $1`,
    [normalizeName(name)]);

export default {
  normalizeName,
  findByName,
};
