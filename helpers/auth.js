const OpenIDConnectStrategy = require('passport-openidconnect');
const passport = require("passport");

const CURRENT_TERMS_VERSION = 1;
const DEBUG_KEYCLOAK_ISSUER = "http://localhost:8080/realms/master";

const {errorHandler} = require("./handlers");
const {getTermsConsent} = require("../models/consents");

const ensureLogIn = require("connect-ensure-login").ensureLoggedIn("/api/auth/login");

const ensureAgreedToTerms = (req, res, next) => {
  if (req.user?.consentedToTerms) {
    next();
  }
  errorHandler(res)("user has not consented to terms");
};

const authStrategy = new OpenIDConnectStrategy({
  // Set some defaults for a local keycloak instance
  // (which won't work in production, environment vars should be set)

  issuer: process.env.VARWIG_ISSUER ?? DEBUG_KEYCLOAK_ISSUER,
  authorizationURL: process.env.VARWIG_AUTH_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
  tokenURL: process.env.VARWIG_TOKEN_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
  userInfoURL: process.env.VARWIG_USERINFO_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,

  clientID: process.env.VARWIG_CLIENT_ID,
  clientSecret: process.env.VARWIG_CLIENT_SECRET,

  callbackURL: `${process.env.VARWIG_BASE_URL ?? ""}/api/auth/callback`,

  scope: ["profile"],  // TODO: Configurable; add CILogon scopes when required
  state: true,  // TODO: ?
}, (issuer, profile, cb) => {
  // TODO: validate issuer, institution field
  // TODO: fetch consentedToTerms from database
  cb(null, {...profile, issuer});
});

passport.serializeUser((user, cb) => process.nextTick(() => {
  cb(null, {
    id: user.id,
    displayName: user.displayName ?? user.username,
    issuer: user.issuer,
  });
}));
passport.deserializeUser((user, cb) => process.nextTick(() => {
  getTermsConsent(user.issuer, user.id, CURRENT_TERMS_VERSION)
    .then(consentedToTerms => cb(null, {...user, consentedToTerms}))
}));

module.exports = {
  CURRENT_TERMS_VERSION,
  ensureLogIn,
  ensureAgreedToTerms,
  authStrategy,
};
