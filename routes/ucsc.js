const express = require('express');
const router = express.Router();

const { textHandler, errorHandler } = require('../helpers/handlers');
const UCSC = require('../models/ucsc');
const Sessions = require('../models/sessions');
const Tracks = require('../models/tracks');

router.get('/hub/:session', ({params}, res) => {

  Promise.resolve(UCSC.generateHub(params.session))
    .then(textHandler(res))
    .catch(errorHandler(res));
});

router.get('/genome/:session', ({params}, res) => {

  const assemblyName = 'hg19';

  Promise.resolve(UCSC.generateGenome(params.session, assemblyName))
    .then(textHandler(res))
    .catch(errorHandler(res));
});

// UCSC Browser tries to get track descriptions here
router.get('/track-db/*.html', (_req, res) => {
  res.end();
});

router.get('/track-db/:session', ({params}, res) => {
  Sessions.get(params.session)
    .then(session =>
      Tracks.get(session.peak)
        .then(tracks => Tracks.merge(tracks, session))
    )
    .then(UCSC.generateTracks)
    .then(textHandler(res))
    .catch(errorHandler(res));
});

module.exports = router;
