import passport from "passport";
import {Strategy as CustomStrategy} from "passport-custom";
// import OpenIDConnectStrategy from "passport-openidconnect";
import {ensureLoggedIn} from "connect-ensure-login";

import {errorHandler} from "./handlers.mjs";
import {getTermsConsent} from "../models/consents.mjs";

export const CURRENT_TERMS_VERSION = 2;
// export const DEBUG_KEYCLOAK_ISSUER = "http://localhost:8080/realms/master";


export const ensureLogIn = ensureLoggedIn("/api/auth/login");

export const ensureAgreedToTerms = (req, res, next) => {
  if (req.user?.consentedToTerms) {
    next();
    return;
  }
  errorHandler(res)("user has not consented to terms");
};

export const authStrategy = new CustomStrategy(
  (req, done) => {
    const ip = req.headers["x-real-ip"];
    if (!ip) {
      done(Error("no X-Real-IP header"), null);
    }
    done(null, {ip});
  },
);

// export const authStrategy = new OpenIDConnectStrategy({
//   // Set some defaults for a local keycloak instance
//   // (which won't work in production, environment vars should be set)
//
//   issuer: process.env.VARWIG_ISSUER ?? DEBUG_KEYCLOAK_ISSUER,
//   authorizationURL: process.env.VARWIG_AUTH_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
//   tokenURL: process.env.VARWIG_TOKEN_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
//   userInfoURL: process.env.VARWIG_USERINFO_URL ?? `${DEBUG_KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
//
//   clientID: process.env.VARWIG_CLIENT_ID,
//   clientSecret: process.env.VARWIG_CLIENT_SECRET,
//
//   callbackURL: `${process.env.VARWIG_BASE_URL ?? ""}/api/auth/callback`,
//
//   scope: (process.env.VARWIG_AUTH_SCOPE ?? "openid").trim().split(/\s+/),
// }, (issuer, profile, cb) => {
//   // TODO: validate issuer, assert presence of institution field if not in dev
//   cb(null, {...profile, issuer});
// });

passport.serializeUser((user, cb) => process.nextTick(() => {
  cb(null, {
    ip: user.ip,
  });
}));
passport.deserializeUser((user, cb) => process.nextTick(() => {
  getTermsConsent(user.ip, CURRENT_TERMS_VERSION)
    .then(consentedToTerms => cb(null, {...user, consentedToTerms}))
}));

export default {
  CURRENT_TERMS_VERSION,
  ensureLogIn,
  ensureAgreedToTerms,
  authStrategy,
};
