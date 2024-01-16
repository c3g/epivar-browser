import fs from "node:fs/promises";
import express from "express";
import {marked} from "marked";
import {gfmHeadingId} from "marked-gfm-heading-id";

import config from "../config.js";
import envConfig from "../envConfig.js";
import {chromosomeSizesByAssemblyID} from "../data/assemblies/index.mjs";
import {dataHandler} from "../helpers/handlers.mjs";

marked.use(gfmHeadingId());

const aboutContent = marked.parse(await fs.readFile(envConfig.ABOUT_MD_PATH, {encoding: "utf-8"}));

export default express.Router().get("", (req, res) => {
  const data = {...config, aboutContent, chromosomeSizes: chromosomeSizesByAssemblyID[config.assembly] };
  delete data["samples"];
  dataHandler(res)(data);
});
