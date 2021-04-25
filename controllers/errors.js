exports.AppError = class extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.SYSTEM_ERROR = 1;
exports.SystemError = class extends exports.AppError {
  constructor(err) {
    super('something went wrong', 500, exports.SYSTEM_ERROR);
    console.error(`system err: ${(err && err.message) || 'unknown'}`);
  }
}

exports.UserError = class extends exports.AppError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    console.error(`user err: ${statusCode} ${code} "${message || 'unknown'}"`);
  }
}

exports.CAST_ERROR = 100;
exports.CastError = class extends exports.UserError {
  constructor(err) {
    super(`invalid ${err.path}: ${typeof(err.value) == 'string' ? "'" + err.value + "'" : err.value}`, 400, exports.CAST_ERROR);
  }
}
