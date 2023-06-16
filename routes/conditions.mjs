import express from "express";

import config from "../config.js";
import {DEFAULT_CONDITIONS} from "../helpers/defaultValues.mjs";
import {dataHandler} from "../helpers/handlers.mjs";

export default express.Router().get("", (req, res) => {
  dataHandler(res)(config.source?.conditions ?? DEFAULT_CONDITIONS);
});
