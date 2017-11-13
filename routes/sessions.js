/*
 * sessions.js
 */

const express = require('express')
const router = express.Router()

const { okHandler, dataHandler, errorHandler } = require('../helpers/handlers')
const Sessions = require('../models/sessions.js')

router.post('/create', (req, res) => {

  Sessions.create(req.body)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
