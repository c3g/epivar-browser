/*
 * auth.js
 */

const passport = require("passport");
const express = require("express");
const router = express.Router();

const { dataHandler } = require('../helpers/handlers');

router.get("/user", (req, res) => {
  dataHandler(res)(req.user);
});

router.get("/login", passport.authenticate("openidconnect"));
router.get("/callback", passport.authenticate("openidconnect", {
  successReturnToOrRedirect: process.env.VARWIG_REDIRECT_TO || "/",
  failureRedirect: "/api/auth/login",
}));

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
