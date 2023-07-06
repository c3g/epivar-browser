const path = await import('path');
import express from 'express';
// const favicon = await import('serve-favicon');
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from "passport";
import { fileURLToPath } from "url";
import { createClient } from "redis";

(await import('dotenv')).config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Set up auth if it's enabled
if (!process.env.VARWIG_DISABLE_AUTH) {
  const session = (await import("express-session")).default;
  const connectRedis = (await import("connect-redis")).default;

  const {authStrategy} = await import("./helpers/auth.mjs");

  const RedisStore = connectRedis(session);

  // Legacy mode redis client for connect-redis
  const redisClient = createClient({legacyMode: true});
  redisClient.connect().catch(console.error);

  app.use(session({
    secret: process.env.VARWIG_SESSION_SECRET,
    httpOnly: false,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({client: redisClient}),
  }));

  passport.use(authStrategy);

  app.use(passport.authenticate("session"));
  app.use("/api/auth",       (await import("./routes/auth.mjs")).default);
}

app.use('/api/assays',       (await import('./routes/assays.mjs')).default);
app.use('/api/autocomplete', (await import('./routes/autocomplete.mjs')).default);
app.use('/api/messages',     (await import('./routes/messages.mjs')).default);
app.use('/api/assembly',     (await import('./routes/assembly.mjs')).default);
app.use('/api/overview',     (await import('./routes/overview.mjs')).default);
app.use('/api/conditions',   (await import('./routes/conditions.mjs')).default);
app.use('/api/ethnicities',  (await import('./routes/ethnicities.mjs')).default);
app.use('/api/peaks',        (await import('./routes/peaks.mjs')).default);
app.use('/api/sessions',     (await import('./routes/sessions.mjs')).default);
app.use('/api/samples',      (await import('./routes/samples.mjs')).default);
app.use('/api/tracks',       (await import('./routes/tracks.mjs')).default);
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
