const express = require('express')
const router = express.Router()

const { dataHandler, textHandler, errorHandler } = require('../helpers/handlers')
const Tracks = require('../models/tracks')

router.use((req, res, next) => {
  res.header('Accept-Ranges', 'bytes')
  return next()
})

router.use('/get', (req, res) => {

  Tracks.get(req.query.chrom, Number(req.query.position))
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

router.use('/values', (req, res) => {
  const peak = req.body

  Tracks.values(peak)
  .then(Tracks.group)
  .then(Tracks.clean)
  .then(Tracks.calculate)
  .then(dataHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
