import fs from "node:fs/promises";
import express from "express";
import {marked} from "marked";

import config from "../config.js";
import envConfig from "../envConfig.js";
import {dataHandler} from "../helpers/handlers.mjs";

const aboutContent = marked.parse(await fs.readFile(envConfig.ABOUT_MD_PATH, {encoding: "utf-8"}));

export default express.Router().get("", (req, res) => {
  const data = {...config, aboutContent};
  delete data["samples"];
  dataHandler(res)(data);
});
