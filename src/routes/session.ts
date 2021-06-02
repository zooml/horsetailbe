import {Request, Response, NextFunction} from 'express';
import { MissingOrUnknSession, SessionExpired, SessionIpMismatch } from '../controllers/errors';
import cookieParser from 'cookie-parser';
import LIMITS from '../common/limits';
import { parseAndMatchPath } from '../utils/util';
import { SEGMENT as SESSIONS_SEG } from './sessions';
import { SEGMENT as USERS_SEG } from './users';

// TODO SECURITY encrypt/decrypt
const createCookie = (req: Request, uId: string) =>
  Buffer.from(`${uId};${req.ip};${Date.now() + LIMITS.session.maxAge * 1000}`, 'ascii').toString('base64');

const parseCookie = (cookie: string) => {
  const a = Buffer.from(cookie, 'base64').toString('ascii').split(';');
  if (a.length !== 3) throw new MissingOrUnknSession();
  const exp = Number.parseInt(a[2]);
  if (!a[0] || !a[1] || Number.isNaN(exp)) throw new MissingOrUnknSession();
  return {
    uId: a[0],
    ip: a[1],
    exp
  };
};

const validateCookie = (req: Request): string => {
  const value = req.signedCookies.ses;
  if (!value) throw new MissingOrUnknSession();
  const ses = parseCookie(value);
  if (ses.ip !== req.ip) throw new SessionIpMismatch();
  if (ses.exp < Date.now()) throw new SessionExpired(); // TODO refresh if within 90% of expiration
  return ses.uId;
};

export const middleware = (pathPrefix: string) => [
  cookieParser(LIMITS.digest.keys),
  (req: Request, res: Response, next: NextFunction) => {
    // only /sessions and POST:/users are exempt from valid session (TODO confirm email too)
    const [iRsc,] = parseAndMatchPath(pathPrefix, req.path, SESSIONS_SEG, USERS_SEG);
    if (!iRsc || (iRsc === 2 && req.method !== 'POST')) {
      const uId = validateCookie(req);
      res.locals.uId = uId;
    }
    next();
  }
];

export const set = (req: Request, res: Response, uId: string): Response => 
  res.cookie('ses', createCookie(req, uId), {signed: true, httpOnly: true});

export const clear = (res: Response): Response => 
  res.clearCookie('ses');