import express, { Request, Response } from 'express';
import { create, STATES, STD_ROLE_IDS, GENERAL_FUND, RoleFlds, UserFlds, FundFields, CloseFlds, countActivePerSA, Doc, CFlds, findById, findActiveByUser } from '../models/org';
import * as rsc from './rsc';
import * as descs from './descs';
import * as actts from './actts';
import * as authz from './authz';
import * as siteacct from '../models/siteacct';
import { InternalError, LimitError } from '../common/apperrs';
import { NotFound } from '../controllers/errors';
import { FIELDS, RESOURCES } from '../common/limits';
import { toBegOfDay, fromDate, begToday } from '../common/acctdate';
import * as doc from '../models/doc';
import ctchEx from '../controllers/ctchex';

export const SEGMENT = 'orgs';
export const router = express.Router();

type RoleGet = {
  id: number;
  uId: string;
  at: number;
};

const fromRoleFlds = (f: RoleFlds): RoleGet => ({
  id: f.id,
  uId: f.uId.toHexString(),
  at: fromDate(f.at)
});

type UserGet = {
  id: string;
  roles: RoleGet[];
};

const fromUserFlds = (f: UserFlds): UserGet => ({
  id: f.id.toHexString(),
  roles: f.roles.map(fromRoleFlds)
});

type FundGet = {
  id: number;
  tag: string;
  begAt: number;
  at: number;
  desc: descs.Get;
  actts: actts.Get[];
};

const fromFundFlds = (f: FundFields): FundGet => ({
  id: f.id,
  tag: f.tag,
  begAt: fromDate(f.begAt),
  at: fromDate(f.at),
  desc: descs.fromFlds(f.desc),
  actts: f.actts.map(actts.fromDoc)
});

type CloseGet = {
  id: number;
  endAt: number;
  at: number;
  desc: descs.Get;
};

const fromCloseFlds = (f: CloseFlds): CloseGet => ({
  id: f.id,
  endAt: fromDate(f.endAt),
  at: fromDate(f.at),
  desc: descs.fromFlds(f.desc)
});

type Get = rsc.Get & {
  saId: string;
  name: string;
  begAt: number;
  desc?: descs.Get;
  users: UserGet[];
  funds?: FundGet[];
  clos?: CloseGet[];
};

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    saId: d.saId.toHexString(),
    name: d.name,
    begAt: fromDate(d.begAt),
    users: d.users.map(fromUserFlds),
  };
  if (d.desc?.uId) g.desc = descs.fromFlds(d.desc);
  if (d.funds) g.funds = d.funds.map(fromFundFlds);
  if (d.clos) g.clos = d.clos.map(fromCloseFlds);
return g;
};

export const lastCloseEndAtFromCachedOrg = (res: Response): Date => {
  const org: Doc = res.locals.org;
  if (!org) throw new InternalError({message: 'org should be cached'});
  return org.clos.length ? org.clos[org.clos.length - 1].endAt : org.begAt;
}

const POST_DEF: rsc.Def = [FIELDS.saId, FIELDS.name, FIELDS.st, FIELDS.begAt, FIELDS.desc, FIELDS.users, FIELDS.funds, FIELDS.clos];

const toCFlds = (o: {[k: string]: any}, uId: doc.ObjId, saId: doc.ObjId): CFlds => {
  const at = new Date();
  return {
    saId,
    name: o.name,
    st: STATES.ACTIVE,
    begAt: o.begAt || begToday(),
    desc: descs.toFlds(o.desc, uId),
    users: [{
      id: uId,
      roles: [{
        id: STD_ROLE_IDS.SUPER,
        uId,
        at}]}],
    funds: [{
      id: GENERAL_FUND.id,
      tag: GENERAL_FUND.tag,
      begAt: toBegOfDay(at),
      at,
      desc: {uId},
      actts: []}],
    clos: []
  };
};

const toValidCFlds = (o: {[k: string]: any}, uId: doc.ObjId, saId: doc.ObjId): CFlds => {
  const f = toCFlds(o, uId, saId);
  rsc.normAndValid(POST_DEF, f, {desc: descs.POST_DEF});
  // TODO when user specifies saId then test exists here
  return f;
};

const validPostLimits = async (f: CFlds) => {
  const forSA = await countActivePerSA(f.saId);
  const max = RESOURCES.orgs.perSA.max;
  if (max <= forSA) throw new LimitError('organizations per site account', max);
};

router.get('/', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const resDocs = await findActiveByUser(res.locals.uId);
  if (Array.isArray(resDocs)) {
    console.log('is array');
    if ('map' in resDocs) {
      console.log('has map');
    }
  }
  // TODO wrong path, test if getting by SA
  res.json(resDocs?.map(fromDoc) ?? []);
}));

router.get('/:id', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const oId: doc.ObjId = res.locals.oId;
  const d: Doc | undefined = res.locals.org;
  if (!d || d.st !== STATES.ACTIVE) throw new NotFound(req.path);
  res.json(fromDoc(d));
}));

router.post('/', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  // TODO add authz when user other than siteacct owner can creat orgs
  const uId: doc.ObjId = res.locals.uId;
  const saId = await siteacct.findIdByUser(uId);
  if (!saId) throw new InternalError({message: `missing siteacct for user ${uId}`});
  const f = toValidCFlds(req.body, uId, saId);
  await validPostLimits(f);
  const d = await create(f);
  res.json(fromDoc(d));
}));
router.patch('/:id', ctchEx(async (req: Request, res: Response) => {
}));