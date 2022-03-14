const OpenIDConnectStrategy = require('passport-openidconnect');
const passport = require("passport");

const DEBUG_KEYCLOAK_ISSUER = "http://localhost:8080/realms/varwig";

const ensureLogIn = require('connect-ensure-login').ensureLoggedIn("/api/auth/login");

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

  scope: ["profile"],  // TODO: Configurable
  state: true,  // TODO: ?
}, (issuer, profile, cb) => {
  console.log(issuer, profile);
  cb(null, profile);
});

passport.serializeUser((user, cb) => process.nextTick(() => {
  cb(null, {id: user.id, username: user.username});
}));
passport.deserializeUser((user, cb) => process.nextTick(() => {
  cb(null, user);
}));

module.exports = {
  ensureLogIn,
  authStrategy,
};
