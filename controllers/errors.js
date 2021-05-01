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
    console.error(`system err: ${(err && err.message) ? '"' + err.message + '"' : 'unknown'}`);
    // TODO log stack trace?
  }
}

exports.UserError = class extends exports.AppError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    console.error(`user err: ${statusCode} ${code} ${message ? '"' + message + '"' : 'unknown'}`);
  }
}

exports.CAST_ERROR = 100;
exports.CastError = class extends exports.UserError {
  constructor(err) {
    super(`invalid type for ${err.path}: ${typeof(err.value) == 'string' ? "'" + err.value + "'" : err.value}`, 400, exports.CAST_ERROR);
  }
}
