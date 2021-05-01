const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const {AppError, ServerError} = require('./controllers/errors');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const accountsRouter = require('./routes/accounts');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  let error = err;
  if (!(err instanceof AppError)) error = new ServerError(err); // not ours so it's unknown
  res.status(error.statusCode);
  res.json({
    code: error.code,
    message: error.message
  });
});

const port = process.env.PORT || 5000;
mongoose
	.connect("mongodb://localhost:27017/horsetaildb", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
	.then(async () => app.listen(port, () => console.log(`Server has started! port ${port}`)));

module.exports = app;
