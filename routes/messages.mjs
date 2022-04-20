/*
 * messages.js
 */

import express from "express";
import { dataHandler } from "../helpers/handlers.mjs";

const router = express.Router();

router.get("/list", (req, res) => {
  dataHandler(res)(req.session?.messages ?? []);
});

export default router;
