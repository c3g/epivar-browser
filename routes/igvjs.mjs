import express from "express";

import {dataHandler, errorHandler, textHandler} from "../helpers/handlers.mjs";
import IGVjs from "../models/browsers/igvjs.mjs";
import Sessions from "../models/sessions.mjs";
import Tracks from "../models/tracks.mjs";

const router = express.Router();

router.get("/perma/track-db/other-tracks", (_req, res) => {
  Promise.resolve(IGVjs.otherTracks)
    .then(textHandler(res))
    .catch(errorHandler(res));
});

// ----------------------------------------------------------------------------

router.get("/track-db/:session", ({params}, res) => {
  Sessions.get(params.session)
    .then(session =>
      Tracks.get(session.peak)
        .then(tracks => Tracks.merge(tracks, session))
    )
    .then(IGVjs.generateTracks)
    .then(dataHandler(res))
    .catch(errorHandler(res));
});

export default router;
