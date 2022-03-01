const sharp = require('sharp');
const express = require('express');
const router = express.Router()

const { dataHandler, pngHandler, errorHandler } = require('../helpers/handlers')
const Tracks = require('../models/tracks')

router.use((req, res, next) => {
  res.header('Accept-Ranges', 'bytes')
  return next()
})

// Unused
// router.use('/get', (req, res) => {
//
//   Tracks.get(req.query.chrom, Number(req.query.position))
//   .then(dataHandler(res))
//   .catch(errorHandler(res))
// })

router.post('/values', (req, res) => {
  const peak = req.body

  Tracks.values(peak)
    .then(Tracks.group)
    .then(Tracks.calculate)
    .then(dataHandler(res))
    .catch(errorHandler(res))
})

router.get('/plot/:peakData', (req, res) => {
  const peakData = req.params.peakData || "";
  if (!peakData) {
    sharp().resize(1, 1).png().toBuffer()
      .then(pngHandler(res.status(400)))
      .catch(err => {
        console.error(err.toString(), err.stack);
        res.status(500).end();
      });
  }

  try {
    const peak = JSON.parse(peakData);
    Tracks.values(peak)
      .then(Tracks.group)
      .then(Tracks.calculate)
      .then(Tracks.plot)
      .then(data =>
        sharp(Buffer.from(data), {density: 300})
          .resize(700*2, 350*2)
          .toBuffer()
      )
      .then(pngHandler(res))
      .catch(err => {
        console.error(err.toString(), err.stack);
        res.status(500).end();
      });
  } catch (err) {
    console.error(err.toString(), err.stack);
    res.status(400).end();
  }
})

module.exports = router
