/* tslint:disable:max-classes-per-file */
import { logError, logWarn } from "../platform/logger";

const MAX_STR_V_LEN = 49;
const sUtcDayBegEnd = '00:00:00.000Z';

const toDateStr = (v: Date): string => {
  // YYYY-MM-DDTHH:mm:ss.sssZ
  const s = v.toISOString();
  if (s.endsWith(sUtcDayBegEnd)) return s.substring(0, 10);
  return s.slice(0, 19).replace('T', ' ');
};

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

export const INTERNAL_ERROR = 1;
export class InternalError extends AppError {
  constructor(err?: any) {
    super('internal error', 500, INTERNAL_ERROR);
    logError(`internal error: ${err?.message ? err.message : 'unknown'}`);
    // TODO log stack trace?
  }
}

export class UserError extends AppError {
  constructor(message: string, statusCode: number, code: number) {
    super(message, statusCode, code);
    logWarn(`user error (${statusCode}, ${code}): ${message ? message : 'unknown'}`);
  }
}

const formatValue = (v: any): string => {
  // TODO v does not convert correctly if object
  let s;
  if (typeof v === 'string') {
    s = (MAX_STR_V_LEN < v.length) ? `'${v.slice(0, MAX_STR_V_LEN)}...'` : `'${v}'`;
  } else if (v instanceof Date) {
    s = toDateStr(v);
  } else { // boolean, number
    s = v.toString();
  }
  return s;
}

export const CAST_ERROR = 1101;
export const REF_ERROR = 1102;
export const DEPENDENT_ERROR = 1103;
export const VALUE_ERROR = 1104;
export const DUP_ERROR = 1105;
export const MISSING_ERROR = 1106;
export const MAX_ERROR = 1107;
export const MIN_ERROR = 1108;
export const FMT_ERROR = 1109;
export const EXTRA_FLDS_ERROR = 1110;
export const DAY_BEG_ERROR = 1111;
export const LIMIT_ERROR = 1112;
export const DB_VALIDATION_ERROR = 1113;

export class BadRequest extends UserError {
  constructor(message: string, code: number) {
    super(message, 400, code);
  }
}
export class BadRequestFld extends BadRequest {
  constructor(path: string, reason: string, code: number) {
    super(`field ${path.charAt(0) === '<' ? path : "'" + path + "'"} ${reason}`, code);
  }
}
export class CastError extends BadRequestFld {
  constructor(path: string, value?: any) {
    super(path, `value ${value? formatValue(value) : ''} not correct type`, CAST_ERROR);
  }
}
export class RefError extends BadRequestFld {
  constructor(path: string, refType: string, id: any) {
    super(path, `has non-existing ${refType} id ${formatValue(id)}`, REF_ERROR);
  }
}
export class DependentError extends BadRequestFld {
  constructor(path: string, other: string, xor?: boolean) {
    super(
      path,
      xor ? `or '${other}' must be set but not both` : `must be set if '${other}' is set`,
      DEPENDENT_ERROR);
  }
}
export class ValueError extends BadRequestFld {
  constructor(path: string, value: any, reason: string) {
    super(path, `value ${formatValue(value)} ${reason}`, VALUE_ERROR);
  }
}
export class DupError extends BadRequestFld {
  constructor(path: string, value: any) {
    super(path, `value ${formatValue(value)} is not unique`, DUP_ERROR);
  }
}
export class MissingError extends BadRequestFld {
  constructor(path: string) {
    super(path, 'is missing', MISSING_ERROR);
  }
}
export class MaxError extends BadRequestFld {
  constructor(path: string, max: number) {
    super(path, `exceeds max length of ${max}`, MAX_ERROR);
  }
}
export class MinError extends BadRequestFld {
  constructor(path: string, min: any) {
    super(path, `does not meet min of ${min}`, MIN_ERROR);
  }
}
export class FmtError extends BadRequestFld {
  constructor(path: string, pattern?: string) {
    super(path, `incorrect format${pattern ? ', should be ' + pattern : ''}`, FMT_ERROR);
  }
}
export class ExtraFldsError extends BadRequestFld {
  constructor(path: string) {
    super(path, 'is not allowed', EXTRA_FLDS_ERROR);
  }
}
export class DayBegError extends BadRequestFld {
  constructor(path: string) {
    super(path, 'is not the start of a day', DAY_BEG_ERROR);
  }
}
export class LimitError extends BadRequest {
  constructor(lim: string, max: number) {
    super(`${lim} exceeds max of ${max}`, LIMIT_ERROR);
  }
}
export class DbValidationError extends BadRequest {
  constructor(msgs: string[]) {
    super(`validation errors: ${msgs.join(', ')}`, DB_VALIDATION_ERROR);
  }
}

