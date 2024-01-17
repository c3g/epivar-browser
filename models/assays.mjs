import {AVAILABLE_ASSAYS} from "../helpers/assays.mjs";
import db from "./db.mjs";

const AVAILABLE_ASSAYS_SET = new Set(AVAILABLE_ASSAYS);

export const list = () => {
  return db.findAll("SELECT id, name FROM assays ORDER BY id")
    .then(rows => rows.map((r) => r.name).filter((a) => AVAILABLE_ASSAYS_SET.includes(a)));
};

export default {
  list,
};
