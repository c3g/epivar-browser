/*
 * messages.js
 */

import express from "express";
import { dataHandler } from "../helpers/handlers.mjs";

export default express.Router().get("/list", (req, res) => {
  dataHandler(res)(req.session?.messages ?? []);
});
