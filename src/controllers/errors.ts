export class AppError extends Error {
  statusCode: number;
  code: number;

  constructor(message: string, statusCode: number, code: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const SERVER_ERROR = 1;
export class ServerError extends AppError {
  constructor(err?: any) {
    super('internal server error', 500, exports.SERVER_ERROR);
    console.error(`server error: ${err?.message ? err.message: 'unknown'}`);
    // TODO log stack trace?
  }
}

export class UserError extends AppError {
  constructor(message: string, statusCode: number, code: number) {
    super(message, statusCode, code);
    console.error(`user error (${statusCode}, ${code}): ${message ? message : 'unknown'}`);
  }
}

const formatValue = (v: any): string => `${typeof(v) == 'string' ? '"' + v + '"' : v}`;

export const CAST_ERROR = 100;
export const REF_ERROR = 101;
export const DEPENDENT_ERROR = 102;
export const VALUE_ERROR = 103;
export const DUP_ERROR = 104;

export class BadRequest extends UserError {
  constructor(path: string, reason: string, code: number) {
    super(`field ${path} ${reason}`, 400, code);
  }
}
export class CastError extends BadRequest {
  constructor(path: string, value: any) {
    super(path, `value ${formatValue(value)} not correct type`, CAST_ERROR);
  }
}
export class RefError extends BadRequest {
  constructor(path: string, refType: string, id: any) {
    super(path, `has non-existing ${refType} id ${formatValue(id)}`, REF_ERROR);
  }
}
export class DependentError extends BadRequest {
  constructor(path: string, other: string, xor?: boolean) {
    super(path, `${xor ? 'cannot' : 'must'} be set if ${other} is set}`, DEPENDENT_ERROR);
  }
}
export class ValueError extends BadRequest {
  constructor(path: string, value: any, reason: string) {
    super(path, `value ${formatValue(value)} ${reason}`, VALUE_ERROR);
  }
}
export class DupError extends BadRequest {
  constructor(path: string, value: any) {
    super(path, `value ${formatValue(value)} is not unique`, DUP_ERROR);
  }
}

const formatPath = (path: string): string => path.length <= 1 ? '(root)' : path;

export const NOT_FOUND = 200;
export class NotFound extends UserError {
  constructor(path: string) {
    super(`path ${formatPath(path)} not found`, 404, NOT_FOUND);
  }
}

