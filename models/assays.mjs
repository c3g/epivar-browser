import {AVAILABLE_ASSAYS_SET} from "../helpers/assays.mjs";
import db from "./db.mjs";

export const list = () => {
  return db.findAll("SELECT id, name FROM assays ORDER BY id")
    .then(rows => rows.map((r) => r.name).filter((a) => AVAILABLE_ASSAYS_SET.has(a)));
};

export default {
  list,
};
