import {Request, Response, NextFunction} from 'express';
import { MissingOrUnknSession, SessionExpired, SessionIpMismatch } from '../controllers/errors';
import cookieParser from 'cookie-parser';
import LIMITS from '../common/limits';
import { parseAndMatchPath } from '../utils/util';
import { SEGMENT as SESSIONS_SEG } from './sessions';
import { SEGMENT as USERS_SEG } from './users';
import { logInfo } from '../platform/logger';
import * as doc from '../models/doc';

// TODO SECURITY encrypt/decrypt
const createCookie = (req: Request, uId: string) =>
  Buffer.from(`${uId};${req.ip};${Date.now() / 1000 + LIMITS.session.maxAge}`, 'ascii').toString('base64');

const parseCookie = (cookie: string) => {
  const a = Buffer.from(cookie, 'base64').toString('ascii').split(';');
  if (a.length !== 3) throw new MissingOrUnknSession();
  const exp = Number.parseInt(a[2], 10);
  if (!a[0] || !a[1] || Number.isNaN(exp)) throw new MissingOrUnknSession();
  return {
    uId: a[0],
    ip: a[1],
    exp
  };
};

const validateCookie = (req: Request, nothro?: boolean): string | undefined => {
  const value = req.signedCookies.ses;
  if (!value) {
    if (nothro) return undefined;
    throw new MissingOrUnknSession();
  }
  const ses = parseCookie(value);
  if (ses.ip !== req.ip) {
    if (nothro) return undefined;
    throw new SessionIpMismatch();
  }
  if (ses.exp * 1000 < Date.now()) {
    if (nothro) return undefined;
    throw new SessionExpired(); // TODO refresh if within 90% of expiration
  }
  return ses.uId;
};

export const middleware = (pathPrefix: string) => [
  cookieParser(LIMITS.digest.keys),
  (req: Request, res: Response, next: NextFunction) => {
    // only /sessions and POST:/users are exempt from valid session (TODO confirm email too)
    const [iRsc,] = parseAndMatchPath(pathPrefix, req.path, SESSIONS_SEG, USERS_SEG);
    if (!iRsc || iRsc === 2) {
      // user POST can either be for self-registration or invitation
      const isUserPOST = iRsc === 2 && req.method === 'POST';
      const uId = validateCookie(req, isUserPOST);
      if (uId) {
        logInfo({uId}, res);
        res.locals.uId = doc.toObjId(uId, 'session'); // should be valid
      }
    }
    next();
  }
];

export const set = (req: Request, res: Response, uId: string): Response =>
// {
//   res.setHeader('Set-Cookie', 'ses=s:NjBkN2YzNjdmZmE3NGFiNGFmY2M0MzM0Ozo6MTsxNjI1OTM4MTUwLjM1OA==.fYCr1JgYR+omnzyB7Pjx7mMHe0UGcgJiGGZbJie90NY; Max-Age=172800; Path=/; Expires=Sat, 10 Jul 2021 17:29:10 GMT; HttpOnly; SameSite=None; Secure');
//   return res;
// };
  res.cookie('ses', createCookie(req, uId), {
    maxAge: LIMITS.session.maxAge * 1000,
    signed: true,
    // domain: 'cloudforest.ga',
    // sameSite: false, // TODO should be 'none'
    // secure: true, // requires https????
    httpOnly: true});

export const clear = (res: Response): Response =>
  res.clearCookie('ses');