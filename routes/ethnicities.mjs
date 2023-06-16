import express from "express";

import config from "../config.js";
import {DEFAULT_ETHNICITIES} from "../helpers/defaultValues.mjs";
import {dataHandler} from "../helpers/handlers.mjs";

export default express.Router().get("", (req, res) => {
  dataHandler(res)(config.source?.ethnicities ?? DEFAULT_ETHNICITIES);
});
