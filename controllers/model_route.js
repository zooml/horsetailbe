const {UserError, CastError} = require('./errors');

const decode_err = err => {
  let error = err;
  if (!(err instanceof UserError)) {
    if (err.name === 'CastError') error = new CastError(err);

    // TODO other db handlers from https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139

  }
  return error;
};

module.exports = fn => (req, res, next) => fn(req, res, next).catch(err => next(decode_err(err)));