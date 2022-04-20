import db from "./db.mjs";

export const list = () => {
  return db.findAll("SELECT id, name FROM assays ORDER BY id")
    .then(rows => rows.map(r => r.name))
};

export default {
  list,
};
