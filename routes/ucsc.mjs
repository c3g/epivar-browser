import express from "express";

import {errorHandler, textHandler} from "../helpers/handlers.mjs";
import Ucsc from "../models/ucsc.mjs";
import Sessions from "../models/sessions.mjs";
import Tracks from "../models/tracks.mjs";

const router = express.Router();

router.get('/hub/:session', ({params}, res) => {
  Promise.resolve(Ucsc.generateHub(params.session))
    .then(textHandler(res))
    .catch(errorHandler(res));
});

router.get('/genome/:session', ({params}, res) => {
  const assemblyName = "hg19";

  Promise.resolve(Ucsc.generateGenome(params.session, assemblyName))
    .then(textHandler(res))
    .catch(errorHandler(res));
});

// UCSC Browser tries to get track descriptions here
router.get("/track-db/*.html", (_req, res) => {
  res.end();
});

router.get("/track-db/:session", ({params}, res) => {
  Sessions.get(params.session)
    .then(session =>
      Tracks.get(session.peak)
        .then(tracks => Tracks.merge(tracks, session))
    )
    .then(Ucsc.generateTracks)
    .then(textHandler(res))
    .catch(errorHandler(res));
});

export default router;
