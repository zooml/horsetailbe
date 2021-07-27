import express, { Request, Response } from 'express';
import * as rsc from './rsc';
import { Get } from '../api/txndocs';
import * as descs from './descs';
import * as authz from './authz';
import { AdjCFlds, AdjFlds, CFlds, countForOrg, create, Doc, findByOrg } from '../models/txndoc';
import { fromDate, toDate } from '../utils/svrdate';
import { FIELDS, RESOURCES } from '../common/limits';
import * as doc from '../models/doc';
import ctchEx from '../controllers/ctchex';
import { lastCloseEndAtFromCachedOrg, validateBegAt } from './orgs';
import { LimitError, ValueError } from '../common/apperrs';
import {Doc as OrgDoc, isFundActiveAt} from '../models/org';
import {Doc as AcctDoc, findByIds as findAccts} from '../models/account';
import { isActiveAt as isAcctActiveAt } from '../models/account';

export const SEGMENT = 'txndocs';
export const router = express.Router();

const fromAdjFlds = (f: AdjFlds) => ({
  acId: f.acId.toHexString(),
  fnId: f.fnId,
  amt: f.amt
});

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    oId: d.oId.toHexString(),
    begAt: fromDate(d.begAt),
    tdTId: d.tdTId,
    desc: descs.fromFlds(d.desc),
    adjs: d.adjs.map(fromAdjFlds)
  };
  if (d.dueAt) g.dueAt = fromDate(d.dueAt);
  return g;
};

const POST_DEF: rsc.Def = [FIELDS.oId, FIELDS.begAt, FIELDS.tdTId, FIELDS.desc, FIELDS.adjs, FIELDS.dueAt];
const ADJ_POST_DEF: rsc.Def = [FIELDS.acId, FIELDS.fnId, FIELDS.amt];

const toAdjCFlds = (o: {[k: string]: any}): AdjCFlds => ({
  acId: doc.toObjId(o.acId),
  fnId: o.fnId,
  amt: o.amt
});
const toCFlds = (o: {[k: string]: any}, uId: doc.ObjId, oId: doc.ObjId): CFlds => {
  const f: CFlds = {
    oId,
    begAt: toDate(o.begAt),
    tdTId: o.tdTId,
    desc: descs.toFlds(o.desc, uId),
    adjs: o.adjs.map(toAdjCFlds)
  };
  if (o.dueAt) f.dueAt = toDate(o.dueAt);
  return f;
};

const validateAdj = (adj: AdjCFlds, org: OrgDoc, begAt: Date, acct?: AcctDoc) => {
  if (adj.amt === 0) throw new ValueError('adjs', 0, 'amt cannot be 0');
  if (!acct || !acct.oId.equals(org._id))
    throw new ValueError('adjs', adj.acId.toHexString(), 'unknown account id');
  if (!isAcctActiveAt(acct, begAt)) throw new ValueError('adjs', adj.acId.toHexString(), 'account inactive at date');
  if (acct.subCnt) throw new ValueError('adjs', adj.acId.toHexString(), 'cannot post to summary account');
  const fund = org.funds.find(fn => fn.id == adj.fnId);
  if (!fund) throw new ValueError('adjs', adj.fnId, 'unknown fund id');
  if (!isFundActiveAt(fund, begAt)) throw new ValueError('adjs', fund.id, 'fund inactive at date');
};

const validateAdjs = async (adjs: AdjCFlds[], org: OrgDoc, begAt: Date) => {
  const sum = adjs.reduce((p, adj) => p + adj.amt, 0);
  if (sum) throw new ValueError('adjs', sum, 'amts credits and debits do not add up to 0');
  const accts = (await findAccts(adjs.map(a => a.acId), {_id: 1, oId: 1, begAt: 1, subCnt: 1, actts: 1}))
    .reduce((p, a) => {p[a._id.toHexString()] = a; return p;}, {} as {[k: string]: AcctDoc});
  adjs.forEach(adj => validateAdj(adj, org, begAt, accts[adj.acId.toHexString()]));
};

const validate = async (f: CFlds, org: OrgDoc, lastCloseEndAt: Date) => {
  validateBegAt(f.begAt, lastCloseEndAt);
  if (f.dueAt && f.dueAt < f.begAt) throw new ValueError('dueAt', f.dueAt, 'dueAt must be same or after begAt');
  await validateAdjs(f.adjs, org, f.begAt);
};

const toValidCFlds = async (o: {[k: string]: any}, uId: doc.ObjId, org: OrgDoc, lastCloseEndAt: Date) => {
  const f = toCFlds(o, uId, org.id);
  rsc.normAndValid(POST_DEF, f, {desc: descs.POST_DEF, adjs: ADJ_POST_DEF});
  await validate(f, org, lastCloseEndAt);
  return f;
};

const validPostLimits = async (f: CFlds) => {
  const forOrg = await countForOrg(f.oId);
  const max = RESOURCES.txndocs.perOrg.max;
  if (max <= forOrg) throw new LimitError('txndocs per organization', max);
};

router.get('/', ctchEx(async (req: Request, res: Response) => {
  await authz.isAllowed(req, res, SEGMENT);
  // TODO page limit
  const oId: doc.ObjId = res.locals.oId;
  const resDocs = await findByOrg(oId);
  res.json(resDocs.map(fromDoc));
}));

router.post('/', ctchEx(async (req: Request, res: Response) => {
  await authz.isAllowed(req, res, SEGMENT);
  const uId: doc.ObjId = res.locals.uId;
  const org: OrgDoc = res.locals.org;
  const lastCloseEndAt = lastCloseEndAtFromCachedOrg(res);
  const f = await toValidCFlds(req.body, uId, org, lastCloseEndAt);
  await validPostLimits(f);
  const resDoc = await create(f);
  res.json(fromDoc(resDoc));
}));
