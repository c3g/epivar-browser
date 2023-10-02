/*
 * auth.js
 */

import passport from "passport";
import express from "express";
const router = express.Router();

import {CURRENT_TERMS_VERSION, ensureLogIn} from "../helpers/auth.mjs";
import {dataHandler} from "../helpers/handlers.mjs";
import {setTermsConsent} from "../models/consents.mjs";

// deserializeUser takes care of loading consentedToTerms
const respondWithUser = (req, res) => dataHandler(res)(req.user ?? undefined);

router.get("/user", respondWithUser);

router.put(
  "/user",
  ensureLogIn,
  (req, res) => {
    // TODO: Validate body

    console.log(req.body);

    const consent = Boolean(req.body.consentedToTerms);

    setTermsConsent(req.user.ip, CURRENT_TERMS_VERSION, consent)
      .then(() => {
        req.user.consentedToTerms = consent;
        return respondWithUser(req, res);
      });
  });

router.get("/login",
  // Add some middleware to handle specified redirects
  // (req, res, next) => {
  //   // We are fine not to sanitize this, since the IdP will not redirect if it's an invalid destination
  //   const returnTo = req.query.redirect;
  //   if (returnTo) {
  //     req.session.returnTo = `${process.env.VARWIG_BASE_URL}${returnTo}`;
  //     req.session.save(err => {if (err) console.error(err); next();});
  //   } else {
  //     next();
  //   }
  // },
  passport.authenticate("custom"),
  (req, res, next) => {
    const returnTo = req.query.redirect;
    if (returnTo) {
      res.redirect(returnTo);
    }
    next();
  });

// router.get("/callback", passport.authenticate("openidconnect", {
//   successReturnToOrRedirect: `${process.env.VARWIG_BASE_URL ?? ""}/`,
//   failureRedirect: `${process.env.VARWIG_BASE_URL ?? ""}/auth-failure`,
//   failureMessage: true,
//   keepSessionInfo: true,
// }));

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) return next(err);
      res.redirect('/');
    });
  });
});

export default router;
