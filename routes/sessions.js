/*
 * sessions.js
 */

const express = require('express');
const router = express.Router();

const {ensureLogIn} = require("../helpers/auth");
const { dataHandler, errorHandler } = require('../helpers/handlers');
const Sessions = require('../models/sessions.js');

router.post('/create', ensureLogIn, ({body}, res) => {
  Sessions.create(body)
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
