import express from "express";

import {errorHandler, textHandler} from "../helpers/handlers.mjs";
import unindent from "../helpers/unindent.mjs";
import Ucsc from "../models/ucsc.mjs";
import Sessions from "../models/sessions.mjs";
import Tracks from "../models/tracks.mjs";

const router = express.Router();

const assemblyName = "hg19";

router.get('/hub/:session', ({params}, res) => {
  Promise.resolve(Ucsc.generateHub(params.session))
    .then(textHandler(res))
    .catch(errorHandler(res));
});

// Collection of routes for perma-linked, publicly-accessible tracks ----------
router.get("/perma/hub/other-tracks", (_req, res) => {
  Promise.resolve(unindent`
    hub EpiVar_Hub
    shortLabel EpiVar Browser Track Hub
    longLabel EpiVar Browser Track Hub
    genomesFile ../genome/other-tracks
    email epivar@computationalgenomics.ca
  `).then(textHandler(res))
    .catch(errorHandler(res));
});
router.get("/perma/genome/other-tracks", (_req, res) => {
  Promise.resolve(Ucsc.generateGenome("other-tracks", assemblyName))
    .then(textHandler(res))
    .catch(errorHandler(res))
})
router.get("/perma/track-db/other-tracks", (_req, res) => {
  Promise.resolve(Ucsc.otherTracks)
    .then(textHandler(res))
    .catch(errorHandler(res));
});
router.get("/perma/track-db/*.html", (_req, res) => {
  res.end();
});
// ----------------------------------------------------------------------------

router.get('/genome/:session', ({params}, res) => {
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
