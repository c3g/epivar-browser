/*
 * auth.js
 */

const passport = require("passport");
const express = require("express");
const router = express.Router();

router.get("/login", passport.authenticate("openidconnect"));
router.get("/callback", passport.authenticate("openidconnect", {
  successReturnToOrRedirect: "/",
  failureRedirect: "/api/auth/login",
}), (req, res) => res.redirect("/"));

router.post('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
