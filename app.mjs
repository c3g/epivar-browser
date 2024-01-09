const path = await import('node:path');
import cors from "cors";
import express from 'express';
// const favicon = await import('serve-favicon');
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from "passport";
import { fileURLToPath } from "url";
import { createClient } from "redis";

import { REDIS_CONNECTION, SESSION_SECRET, PORTAL_ORIGIN } from "./envConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  origin: PORTAL_ORIGIN,
  methods: ["GET", "POST"],
  credentials: true,
  preflightContinue: true,
}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger(':req[x-real-ip] [:date[clf]] :method :url :status :response-time ms - :res[content-length]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up auth if it's enabled
if (!process.env.VARWIG_DISABLE_AUTH) {
  const session = (await import("express-session")).default;
  const connectRedis = (await import("connect-redis")).default;

  const {authStrategy} = await import("./helpers/auth.mjs");

  const RedisStore = connectRedis(session);

  // Legacy mode redis client for connect-redis
  const redisClient = createClient({ url: REDIS_CONNECTION, legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use(session({
    secret: SESSION_SECRET,
    httpOnly: false,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({client: redisClient}),
  }));

  passport.use(authStrategy);

  app.use(passport.authenticate("session"));
  app.use("/api/auth",       (await import("./routes/auth.mjs")).default);
}
//  - utility routers
app.use('/api/messages',     (await import('./routes/messages.mjs')).default);

//  - common data
app.use('/api/assays',       (await import('./routes/assays.mjs')).default);
//  - dataset title, dataset, conditions, ethnicities:
app.use('/api/dataset',      (await import('./routes/dataset.mjs')).default);
//  - data access routers
app.use('/api/autocomplete', (await import('./routes/autocomplete.mjs')).default);
app.use('/api/overview',     (await import('./routes/overview.mjs')).default);
app.use('/api/peaks',        (await import('./routes/peaks.mjs')).default);
app.use('/api/sessions',     (await import('./routes/sessions.mjs')).default);
app.use('/api/tracks',       (await import('./routes/tracks.mjs')).default);
//  - routers for genome browsers
app.use('/api/igvjs',        (await import('./routes/igvjs.mjs')).default);
app.use('/api/ucsc',         (await import('./routes/ucsc.mjs')).default);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err?.status ?? 500)
  res.render('error')
});

export default app;
