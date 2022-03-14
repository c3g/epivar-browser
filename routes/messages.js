/*
 * messages.js
 */

const express = require("express");
const router = express.Router();

const { dataHandler } = require('../helpers/handlers');

router.get("/messages", (req, res) => {
  dataHandler(res)(req.session?.messages ?? []);
});

module.exports = router;
