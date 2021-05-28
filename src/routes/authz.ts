import { Request, Response, NextFunction } from 'express';
import { isPathSeg, tryCatch } from '../utils/util';
import { ServerError, OrgDenied } from '../controllers/errors';
import { SEGMENT as SESSIONS_SEG } from './sessions';
import { SEGMENT as USERS_SEG } from './users';
import { SEGMENT as SITEACCT_SEG } from './siteaccts';
import { findRolesForUser } from './orgs';
import { ROLES } from '../models/org';

const OID_HDR = 'x-oid';

export const authzMiddleware = (pathPrefix: string) => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const oId = (OID_HDR in req.headers) ? req.headers[OID_HDR] : req.query.oId;
    res.locals.oId = oId;
    const iRsc = isPathSeg(pathPrefix, req.path, SITEACCT_SEG, SESSIONS_SEG, USERS_SEG);
    if (!iRsc || iRsc === 1) {
      const uId = res.locals.uId;
      let allowed = false;
      if (iRsc === 1) {
        // TODO SECURITY siteacct perms
      } else {
        let roles = await findRolesForUser(res);
        switch (req.method) {
          case 'GET': // read
            allowed = 0 < roles.length; // all roles allow read of everything (TODO for now!)
            break;
          default: // write
            allowed = roles.includes(ROLES.ADMIN);
        }
      }
      if (!allowed) {
        throw new OrgDenied();
      }
    }
  }
  next();
};