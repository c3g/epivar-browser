import express from "express";

import config from "../config.js";
import {dataHandler} from "../helpers/handlers.mjs";

export default express.Router().get("", (req, res) => {
  dataHandler(res)(config.assembly);
});
