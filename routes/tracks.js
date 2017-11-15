const express = require('express')
const router = express.Router()

const { dataHandler, textHandler, errorHandler } = require('../helpers/handlers')
const Tracks = require('../models/tracks')

router.use('/get', (req, res) => {

  Tracks.get(req.query.chrom, Number(req.query.position))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

router.use('/values', (req, res) => {

  Tracks.values(req.query.chrom, Number(req.query.position))
  .then(Tracks.group)
  .then(Tracks.clean)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
