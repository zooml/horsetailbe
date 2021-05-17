import {Request, Response, NextFunction} from 'express';
import { MissingOrUnknSession, SessionExpired, SessionIpMismatch } from './errors';
import cookieParser from 'cookie-parser';
import limits from './limits';

const createCookie = (req: Request, uId: string) =>
  btoa(`${uId};${req.ip};${Date.now() + limits.session.maxAge * 1000}`);

const parseCookie = (cookie: string) => {
  const a = atob(cookie).split(';');
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
  if (ses.exp < Date.now()) throw new SessionExpired();
  return ses.uId;
};

export const sessionMiddleware = (pathPrefix: string) => [
  cookieParser(limits.digest.keys),
  (req: Request, res: Response, next: NextFunction) => {
    if (!(req.method === 'HEAD'
      || req.method === 'OPTIONS'
      || (req.path.startsWith(pathPrefix)
        && (req.path.endsWith('sessions')
          || (req.path.endsWith('users') && req.method === 'POST'))))) {
      const uId = validateCookie(req);
      res.locals.uId = uId;
    }
    next();
  }
];

export const sessionSet = (req: Request, res: Response, uId: string): Response => 
  res.cookie('ses', createCookie(req, uId), {signed: true, httpOnly: true});

export const sessionClear = (res: Response): Response => 
  res.clearCookie('ses');