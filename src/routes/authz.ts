import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../controllers/errors';
import * as sessions from './sessions';
import * as doc from '../models/doc';
import * as user from '../models/user';
import * as users from './users';
import * as siteaccts from './siteaccts';
import * as accounts from './accounts';
import * as txndocs from './txndocs';
import * as org from '../models/org';
import * as orgs from './orgs';
import { findActiveRolesForUser, STD_ROLE_IDS } from '../models/org';
import { ParsedQs } from 'qs';
import { InternalError, MissingError } from '../common/apperrs';

const OID_HDR = 'x-oid';

const isReadMethod = (req: Request) => { // TODO needed?
  switch (req.method) {
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
      return true;
  }
  return false;
};

const qs = (v: string | ParsedQs | string[] | ParsedQs[]) => typeof v === 'string' ? v : undefined;

const hs = (v: string | string[]) => typeof v === 'string' ? v : undefined;

export const notFound = (pathPrefix: string) => (req: Request, res: Response, next: NextFunction) =>
  // catch all non-existent resources to prevent probing of paths
  next(new ForbiddenError(res.locals.uId?.toHexString(), req.method,
         pathPrefix + req.path.substring(1), undefined, 'unknown path'));

export type ValidOpts = {
  rscSub?: string;
  invite?: boolean; // user POST for invite
};

const cacheOrg = async (res: Response): Promise<org.Doc> => {
  if (res.locals.oId && !res.locals.org) {
    res.locals.org = await org.findById(res.locals.oId);
  }
  return res.locals.org;
}

const cacheRoles = async (res: Response): Promise<number[]> => {
  const org = await cacheOrg(res);
  const uId: doc.ObjId = res.locals.uId;

  // TODO check role of uId
  return [];
}

export const validate = async (req: Request, res: Response, rsc: string, opts?: ValidOpts) => {
  let allowed = false;
  if (rsc === sessions.SEGMENT) {
    // no perms required for sign in/out sessions (note sign in requires perms and active)
    // allow: all
    allowed = true;
  } else {
    // the valid session cookie has already stored the uId
    // note the session is not checked for "sessions" path and is optional for POST "users"
    // a valid session is assumed to indicate valid user--TODO SECURITY: need was to suspend users immediately
    // TODO could put this here (or cache user for PERF)
    // if (!await user.activeExists(uId)) throw new ForbiddenError(uId.toHexString(), req.method, rsc, rscId, 'user is not active');
    const uId: doc.ObjId = res.locals.uId;
    // method for specific resource will have this set
    const rscId = req.params.id;
    // see if there is a oId anywhere and cache
    let oId;
    if (rsc === orgs.SEGMENT && rscId) oId = doc.toObjId(rscId, 'orgs id');
    else { // prioritize query oId over header
      const q = qs(req.query.oId);
      if (q) oId = doc.toObjId(q, 'query oId');
      else {
        const h = hs(req.headers[OID_HDR]);
        if (h) oId = doc.toObjId(h, OID_HDR);
      }
    }
    res.locals.oId = oId;
    const meth = req.method;
    const isRead = isReadMethod(req);

    // const roles = await findActiveRolesForUser(oId, uId);
    // res.locals.roles = roles;

    // TODO HEAD, OPTIONS????

    switch (rsc) {
      case users.SEGMENT:
        if (meth === 'POST') {
          // allow: all for self-register, or TODO org SUPER for invite (uId is set)
          allowed = true;
        } else if (meth === 'PATCH') {
          // allow: self only (TODO SECURITY: how to set suspended????)
          allowed = uId.toHexString() === rscId;
        } else if (isRead) {
          // allow: all,  ASSUMING READING ACTIVE USER (TODO SECURITY: restrict to members of same orgs?)
          allowed = true;
        }
        break;
      case orgs.SEGMENT:

        allowed = true; // TODO remove!!!!!!!!
        if (meth === 'POST') {
          // allow: 
          // allowed = 
        } else if (meth === 'PATCH') {
          // allow: 
          // allowed = 
        } else if (meth === 'GET') {
          if (oId) {
            const roles = await cacheRoles(res);
            
            // TODO check roles

          } else {
            // reading all that user is member of
            // allow: all, ASSUMING QUERY BY UID
            allowed = true;
          }
        }
        break;
      case accounts.SEGMENT:
        if (!oId) throw new MissingError('oId in header or query')

        allowed = true; // TODO remove!!!!!!!!

        if (meth === 'POST') {
          // org needed for validation
          // allow: 
          // allowed = 
          await cacheOrg(res);
        } else if (meth === 'PATCH') {
          // allow: 
          // allowed = 
        } else if (meth === 'GET') {
          if (oId) {
            const roles = await cacheRoles(res);
            
            // TODO check roles

          } else {
            // reading all that user is member of
            // allow: all, ASSUMING QUERY BY UID
            allowed = true;
          }
        }
        break;
      case txndocs.SEGMENT:
        if (!oId) throw new MissingError('oId in header or query')

        allowed = true; // TODO remove!!!!!!!!

        break;
      case siteaccts.SEGMENT:
        break;
    }
  }
  // if (!allowed) throw new ForbiddenError(uId, isRead, rsc, rscId);
}