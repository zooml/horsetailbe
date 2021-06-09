import express, { Request, Response } from 'express';
import { create, STATES, STD_ROLE_IDS, GENERAL_FUND, RoleFlds, UserFlds, FundFields, CloseFlds, countPerSA, Doc, CFlds, findById, findByUser } from '../models/org';
import { NotFound } from 'http-errors';
import * as rsc from './rsc';
import * as descs from './descs';
import * as actts from './actts';
import * as authz from './authz';
import * as siteacct from '../models/siteacct';
import { InternalError, LimitError } from '../common/apperrs';
import { FIELDS, RESOURCES } from '../common/limits';
import { begOfDay, fromDate } from '../common/acctdate';
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
  uId: f.uId.toString(),
  at: fromDate(f.at)
});

type UserGet = {
  id: string;
  roles: RoleGet[];
};

const fromUserFlds = (f: UserFlds): UserGet => ({
  id: f.id.toString(),
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
  desc: descs.Get;
  users: UserGet[];
  funds: FundGet[];
  clos: CloseGet[];
};

const fromDoc = (d: Doc): Get => ({
  ...rsc.fromDoc(d),
  saId: d.saId.toString(),
  name: d.name,
  desc: descs.fromFlds(d.desc),
  users: d.users.map(fromUserFlds),
  funds: d.funds.map(fromFundFlds),
  clos: d.clos.map(fromCloseFlds)
});

const POST_DEF: rsc.Def = [FIELDS.saId, FIELDS.name, FIELDS.st, FIELDS.desc];

const toCFlds = (o: {[k: string]: any}, uId: doc.ObjId, saId: doc.ObjId): CFlds => {
  const at = new Date();
  return {
    saId,
    name: o.name,
    st: STATES.ACTIVE,
    desc: descs.toFlds(o.desc, uId),
    users: [{
      id: uId,
      roles: [{
        id: STD_ROLE_IDS.SUPER,
        uId: uId,
        at}]}],
    funds: [{
      id: GENERAL_FUND.id,
      tag: GENERAL_FUND.tag,
      begAt: begOfDay(at),
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
  const forSA = await countPerSA(f.saId);
  const max = RESOURCES.orgs.perSA.max;
  if (max <= forSA) throw new LimitError('organizations per site account', max);
};

router.get('/', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const resDocs = await findByUser(res.locals.uId);
  // TODO wrong path, test if getting by SA
  res.json(resDocs?.map(fromDoc) ?? []);
}));

router.get('/:id', ctchEx(async (req: Request, res: Response) => {
  const id = req.params.id;
  // perf: find org first then pass in roles and 403 if not allowed or not found
  const resDoc = await findById(id);
  const roles = resDoc?.users.find(u => u.id.toString() === id)?.roles.map(r => r.id) ?? [];
  await authz.validate(req, res, SEGMENT, id, roles);
  if (!resDoc || resDoc.st !== STATES.ACTIVE) throw new NotFound(req.path); // do after authz
  res.json(fromDoc(resDoc));
}));

router.post('/', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  // TODO add authz when user other than siteacct owner can creat orgs
  const uId = doc.toObjId(res.locals.uId);
  const saId = await siteacct.findIdByUser(uId);
  if (!saId) throw new InternalError({message: `missing siteacct for user ${uId}`});
  const f = toValidCFlds(req.body, uId, saId);
  await validPostLimits(f);
  const resDoc = await create(f);
  res.json(fromDoc(resDoc));
}));
