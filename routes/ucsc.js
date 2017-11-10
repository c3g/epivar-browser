const express = require('express')
const router = express.Router()

const { textHandler, errorHandler } = require('../helpers/handlers')
const UCSC = require('../models/ucsc')
const Sessions = require('../models/sessions')
const Tracks = require('../models/tracks')

router.use('/hub/:session', (req, res) => {

  Promise.resolve(UCSC.generateHub(req.params.session))
  .then(textHandler(res))
  .catch(errorHandler(res))
})

router.use('/genome/:session', (req, res) => {

  const assemblyName = 'hg19'

  Promise.resolve(UCSC.generateGenome(req.params.session, assemblyName))
  .then(textHandler(res))
  .catch(errorHandler(res))
})

router.use('/track-db/:session', (req, res) => {

  Sessions.get(req.params.session)
  .then(Tracks.get)
  .then(Tracks.merge)
  .then(UCSC.generateTracks)
  .then(textHandler(res))
  .catch(errorHandler(res))
})

module.exports = router
