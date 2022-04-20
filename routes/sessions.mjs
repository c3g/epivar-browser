/*
 * sessions.js
 */

import express from "express";

import Sessions from "../models/sessions.mjs";
import {dataHandler, errorHandler} from "../helpers/handlers.mjs";
import {ensureLogIn} from "../helpers/auth.mjs";

const router = express.Router();

router.post('/create', ensureLogIn, ({body}, res) => {
  Sessions.create(body)
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
