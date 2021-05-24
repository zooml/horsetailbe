import {logError, logWarn} from './logger';

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
    logError(`server error: ${err?.message ? err.message: 'unknown'}`);
    // TODO log stack trace?
  }
}

export class UserError extends AppError {
  constructor(message: string, statusCode: number, code: number) {
    super(message, statusCode, code);
    logWarn(`user error (${statusCode}, ${code}): ${message ? message : 'unknown'}`);
  }
}

const formatValue = (v: any): string => `${typeof(v) == 'string' ? '"' + v + '"' : v}`;

export const CAST_ERROR = 1100;
export const REF_ERROR = 1101;
export const DEPENDENT_ERROR = 1102;
export const VALUE_ERROR = 1103;
export const DUP_ERROR = 1104;
export const MISSING_ERROR = 1105;
export const MAX_ERROR = 1106;

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
    super(
      path, 
      xor ? `or ${other} must be set but not both` : `must be set if ${other} is set`,
      DEPENDENT_ERROR);
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
export class MissingError extends BadRequest {
  constructor(path: string) {
    super(path, 'is missing', MISSING_ERROR);
  }
}
export class MaxError extends BadRequest {
  constructor(path: string, max: number) {
    super(path, `exceeds max length of ${max}`, MAX_ERROR);
  }
}

export const CREDENTIALS_ERROR = 1200;
export const MISSING_OR_UNKN_SESSION = 1201;
export const SESSION_IP_MISMATCH = 1202;
export const SESSION_EXPIRED = 1203;
export const USER_NOT_ACTIVE = 1204;
export class AuthnError extends UserError {
  constructor(message: string, code: number) {
    super(message, 401, code);
  }
}
export class CredentialsError extends AuthnError {
  constructor() {
    super('email or password not recognized', CREDENTIALS_ERROR);
  }
}
export class MissingOrUnknSession extends AuthnError {
  constructor() {
    super('missing or unknown session cookie', MISSING_OR_UNKN_SESSION);
  }
}
export class SessionIpMismatch extends AuthnError {
  constructor() {
    super('session ip mismatch', SESSION_IP_MISMATCH);
  }
}
export class SessionExpired extends AuthnError {
  constructor() {
    super('session expired', SESSION_EXPIRED);
  }
}
export class UserNotActive extends AuthnError {
  constructor() {
    super('user not active', USER_NOT_ACTIVE);
  }
}

const formatUrlPath = (path: string): string => path.length <= 1 ? '(root)' : path;

export const NOT_FOUND = 1300;
export class NotFound extends UserError {
  constructor(path: string) {
    super(`path ${formatUrlPath(path)} not found`, 404, NOT_FOUND);
  }
}

