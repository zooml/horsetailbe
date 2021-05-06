const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const {AppError, ServerError, NotFound} = require('./controllers/errors');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const accountsRouter = require('./routes/accounts');
const cors = require('cors');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// TODO don't execute if production
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const prefix = '/api/v1/'
app.use(prefix, indexRouter);
app.use(prefix + 'users', usersRouter);
app.use(prefix + 'accounts', accountsRouter);

// default: 'no api' 404 and forward to error handler
app.use((req, res, next) => next(new NotFound({
  path: req.path.startsWith(prefix) ? req.path.substring(prefix.length) : (
    req.path.length <= 1 ? '(empty)' : req.path.substring(1))
})));

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {// delegate to express
    return next(err);
  }
  if (err instanceof createError.HttpError) { // maybe set by express
    res.status(err.statusCode);
    res.json({}); // TODO
  } else {
    let error = err;
    if (!(err instanceof AppError)) error = new ServerError(err); // not ours so it's unknown
    res.status(error.statusCode);
    res.json({
      code: error.code,
      message: error.message
    });
    }
});

// TODO use debug() https://github.com/visionmedia/debug#readme

// TODO config
mongoose
	.connect("mongodb://localhost:27017/horsetaildb", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
	.then(() => console.log('mongoose initialized'));

module.exports = app;
