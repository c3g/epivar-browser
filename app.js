const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require("passport");
const { createClient } = require("redis");

require('dotenv').config();

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
  const session = require("express-session");
  const connectRedis = require("connect-redis");

  const {authStrategy} = require("./helpers/auth");

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
  app.use("/api/auth",       require("./routes/auth"));
}

app.use('/api/assays',       require('./routes/assays'))
app.use('/api/autocomplete', require('./routes/autocomplete'))
app.use('/api/peaks',        require('./routes/peaks'))
app.use('/api/ucsc',         require('./routes/ucsc'))
app.use('/api/sessions',     require('./routes/sessions'))
app.use('/api/samples',      require('./routes/samples'))
app.use('/api/tracks',       require('./routes/tracks'))


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
})

module.exports = app;
