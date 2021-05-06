exports.AppError = class extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.SERVER_ERROR = 1;
exports.ServerError = class extends exports.AppError {
  constructor(err) {
    super('internal server error', 500, exports.SERVER_ERROR);
    console.error(`server error: ${(err && err.message) ? err.message: 'unknown'}`);
    // TODO log stack trace?
  }
}

exports.UserError = class extends exports.AppError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    console.error(`user error (${statusCode}, ${code}): ${message ? message : 'unknown'}`);
  }
}

exports.NOT_FOUND = 100;
exports.NotFound = class extends exports.UserError {
  constructor(err) {
    super(`path ${err.path} not found`, 404, exports.NOT_FOUND);
  }
}

const formatValue = v => `${typeof(v) == 'string' ? '"' + v + '"' : v}`;

exports.CAST_ERROR = 200;
exports.CastError = class extends exports.UserError {
  constructor(err) {
    super(`field ${err.path} type does not match value ${formatValue(err.value)}`, 400, exports.CAST_ERROR);
    console.log(err);// TODO see if anything else in mongo err, then remove
  }
}
