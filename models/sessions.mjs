/*
 * sessions.js
 */

import md5 from "md5";

import db from "./db.mjs";
import Tracks from "./tracks.mjs";

export default {
  create,
  get,
};

async function create(peak) {
  const tracksByCondition =
    await Tracks.values(peak).then(Tracks.group);

  const samples =
    Object.values(tracksByCondition).flat().map(d => d.donor);
  samples.sort(Intl.Collator().compare)

  const session = { samples, peak }
  const text = JSON.stringify(session)
  const hash = md5(text)

  return get(hash).then(row => {
    if (row) {
      return hash;
    }

    return db.insert(
      `INSERT INTO sessions
                   (hash, samples, peak)
            VALUES ($1,   $2,      $3)`,
      [
        hash,
        JSON.stringify(samples),
        JSON.stringify(peak),
      ]
    )
    .then(() => hash);
  })
}

function get(hash) {
  return db.findOne(`SELECT * FROM sessions WHERE hash = $1`, [hash])
    .then(row => {
      if (!row) {
        return undefined;
      }
      row.samples = JSON.parse(row.samples)
      row.peak = JSON.parse(row.peak)
      return row;
    });
}
