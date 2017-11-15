const express = require('express')
const router = express.Router()

const { dataHandler, textHandler, errorHandler } = require('../helpers/handlers')
const Tracks = require('../models/tracks')

router.use('/get', (req, res) => {

  Tracks.get(req.query.chrom, req.query.position)
  .then(res => console.log('RES', res) || res)
  .then(dataHandler(res))
  .catch(err => console.log(err))
  .catch(errorHandler(res))
})

module.exports = router
