import { Request, Response, NextFunction } from 'express';
import { extractSegs } from '../utils/util';
import { ForbiddenError } from '../controllers/errors';
import * as sessions from './sessions';
import * as users from './users';
import * as siteaccts from './siteaccts';
import * as accounts from './accounts';
import * as txndocs from './txndocs';
import * as orgs from './orgs';
import { findRolesForUser, STD_ROLE_IDS } from '../models/org';
import { logError } from '../platform/logger';

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

export const preMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
  res.locals.oId = req.query.oId ?? req.headers[OID_HDR];
  next();
};

export const notFound = (pathPrefix: string) => (req: Request, res: Response) => {
  // catch all non-existent resources to prevent probing of paths
  throw new ForbiddenError(res.locals.uId, isReadMethod(req),
    req.path, undefined, 'unknown resource'); // TODO add pathPrefix????
};

export const validate = async (req: Request, res: Response, rsc: string, rscId?: string, roles?: number[]) => {
  let allowed = false;
  const isRead = isReadMethod(req);
  const oId = res.locals.oId;
  const uId = res.locals.uId;
  if (rsc === sessions.SEGMENT) {
    // no perms required for creating/deleting sessions
    allowed = true;
  } else {
    const rs = roles ?? await findRolesForUser(oId, uId);
    res.locals.roles = rs;
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
  // if (!allowed) throw new ForbiddenError(uId, isRead, rsc, rscId);
}