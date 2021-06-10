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
import { InternalError } from '../common/apperrs';

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

export const validate = async (req: Request, res: Response, rsc: string, rscId?: string, rscSub?: string) => {
  let allowed = false;
  if (rsc === sessions.SEGMENT) {
    // no perms required for creating/deleting sessions
    allowed = true;
  } else {
    const uId: doc.ObjId = res.locals.uId;
    const meth = req.method;
    const isRead = isReadMethod(req);
    let oId;
    if (rsc == orgs.SEGMENT && rscId) oId = doc.toObjId(rscId, 'orgs id');
    else {
      const q = qs(req.query.oId);
      if (q) oId = doc.toObjId(q, 'query oId');
      else {
        const h = hs(req.headers[OID_HDR]);
        if (h) oId = doc.toObjId(h, OID_HDR);
      }
    }
    res.locals.oId = oId;
    if (rsc === users.SEGMENT) {
      // POST: register user: (1) self, or (2) invite (uId is valid)
      if (meth === 'POST') {

      } else if (meth === 'PATCH') {

      } else if (isRead) {

      } else throw new InternalError({message: `missing authz case: users ${meth}`});


    } else if (meth === 'xxx') {

      // user may have been deactivated while session still valid
      // TODO PERF: cache this
      if (!await user.activeExists(uId)) throw new ForbiddenError(uId.toHexString(), req.method, rsc, rscId, 'user is not active');
      // get the org, if specified
      // TODO PERF: cache this

      res.locals.org = oId ? await org.findById(oId) : undefined;
      // TODO check if: exists, active

      if (rsc === orgs.SEGMENT) {
        // POST: any user can create their own org
        // PATCH: check perms (subcases, e.g. roles vs funds vs closes?????)

        // note: OK to read non-active????? NO


      } else {
        const roles = await findActiveRolesForUser(oId, uId);
        res.locals.roles = roles;
        switch (rsc) {
          case users.SEGMENT:
            // no current method restrictions
            allowed = true;
            break;
          case orgs.SEGMENT:

            break;
          case siteaccts.SEGMENT:
            break;
          case accounts.SEGMENT:
            break;
          case txndocs.SEGMENT:
          break;
        }
      }
    }
  }
  // if (!allowed) throw new ForbiddenError(uId, isRead, rsc, rscId);
}