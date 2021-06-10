/* tslint:disable:max-classes-per-file */
import { UserError } from '../common/apperrs';

export const CREDENTIALS_ERROR = 1201;
export const MISSING_OR_UNKN_SESSION = 1202;
export const SESSION_IP_MISMATCH = 1203;
export const SESSION_EXPIRED = 1204;
export const USER_NOT_ACTIVE = 1205;
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

const formatUrlPath = (path: string): string => path.length <= 1 ? '<root>' : path;

export const FORBIDDEN_ERROR = 1301;
export class ForbiddenError extends UserError {
  constructor(uId: string | undefined, meth: string, rsc: string, rscId?: string, msg?: string) {
    super(`uId ${uId ?? '<unknown>'} forbidden ${meth} on ${rsc}${rscId? '/' + rscId : ''}${msg ? ' (' + msg + ') ' : ''}`,
      403, FORBIDDEN_ERROR);
  }
}

export const NOT_FOUND = 1401;
export class NotFound extends UserError {
  constructor(path: string) {
    super(`path ${formatUrlPath(path)} not found`, 404, NOT_FOUND);
  }
}
