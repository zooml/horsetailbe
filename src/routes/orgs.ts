import express, { Request, Response } from 'express';
import modelRoute from '../controllers/modelroute';
import { Doc, Model, STD_ROLE_IDS, GENERAL_FUND, RoleDoc, UserDoc, FundDoc, CloseDoc, countOrgsPerSA } from '../models/org';
import { NotFound } from 'http-errors';
import * as rsc from './rsc';
import * as descs from './descs';
import * as acttgls from './acttgls';
import * as authz from './authz';
import * as siteacct from '../models/siteacct';
import { InternalError, LimitError } from '../common/apperrs';
import { FIELDS, RESOURCES } from '../common/limits';
import { fromDate } from '../common/acctdate';
import { toObjId } from '../models/doc';

export const SEGMENT = 'orgs';
export const router = express.Router();

type RoleGet = {
  id: number;
  uId: string;
  at: number;
};

const fromRoleDoc = (doc: RoleDoc): RoleGet => ({
  id: doc.id,
  uId: doc.uId.toString(),
  at: fromDate(doc.at)
});

type UserGet = {
  id: string;
  roles: RoleGet[];
};

const fromUserDoc = (doc: UserDoc): UserGet => ({
  id: doc.id.toString(),
  roles: doc.roles.map(fromRoleDoc)
});

type FundGet = {
  id: number;
  tag: string;
  begAt?: number;
  at: number;
  desc: descs.Get;
  actts: acttgls.Get[];
};

const fromFundDoc = (doc: FundDoc): FundGet => ({
  id: doc.id,
  tag: doc.tag,
  begAt: fromDate(doc.begAt),
  at: fromDate(doc.at),
  desc: descs.fromDoc(doc.desc),
  actts: doc.actts?.map(acttgls.fromDoc)
});

type CloseGet = {
  id: number;
  endAt: number;
  at: number;
  desc: descs.Get;
};

const fromCloseDoc = (doc: CloseDoc): CloseGet => ({
  id: doc.id,
  endAt: fromDate(doc.endAt),
  at: fromDate(doc.at),
  desc: descs.fromDoc(doc.desc)
});

type Get = rsc.GetBase & {
  saId: string;
  name: string;
  desc: descs.Get;
  users: UserGet[];
  funds: FundGet[];
  clos: CloseGet[];
};

const fromDoc = (doc: Doc): Get => ({
  ...rsc.fromDoc(doc),
  saId: doc.saId.toString(),
  name: doc.name,
  desc: descs.fromDoc(doc.desc),
  users: doc.users.map(fromUserDoc),
  funds: doc.funds.map(fromFundDoc),
  clos: doc.clos.map(fromCloseDoc)
});

const POST_DEF: rsc.Def = [FIELDS.saId, FIELDS.name, FIELDS.desc];

const toDoc = (o: {[k: string]: any}, uId: string): Doc => new Model({
  saId: o.saId,
  name: o.name,
  desc: descs.toDoc(o.desc, uId)
});

const toValidDoc = (o: {[k: string]: any}, uId: string): Doc => {
  const post = {...o};
  rsc.normAndValid(POST_DEF, post, {desc: descs.POST_DEF});
  // TODO when user spec's saId then test exists here
  const doc = toDoc(post, uId);
  // add defaults
  const at = new Date();
  const uObjId = toObjId(uId);
  doc.users = [{
    id: uObjId,
    roles: [{
      id: STD_ROLE_IDS.SUPER,
      uId: uObjId,
      at}]}];
  doc.funds = [{
    id: GENERAL_FUND.id,
    tag: GENERAL_FUND.tag,
    at,
    desc: {uId: uObjId},
    actts: []}];
  return doc;
};

const applyPostLimits = async (doc: Doc) => {
  const perSA = await countOrgsPerSA(doc.saId);
  const lims = RESOURCES.orgs.perSA;
  if (lims.max <= perSA) throw new LimitError('organizations per site account', lims.max);
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  authz.validate(req, res, SEGMENT);
  const resDocs = await Model.find({'users.id': res.locals.uId}, {id: 1, saId: 1, name: 1, 'users.$': 1});
  // TODO wrong path, test if getting by SA
  res.send(resDocs?.map(fromDoc) ?? []);
}));

router.get('/:id', modelRoute(async (req: Request, res: Response) => {
  const id = req.params.id;
  // perf: find org first then pass in roles and 403 if not allowed or not found
  const resDoc = await Model.findById(id);
  const roles = resDoc?.users.find(u => u.id.toString() === id)?.roles.map(r => r.id) ?? [];
  authz.validate(req, res, SEGMENT, id, roles);
  if (!resDoc) throw new NotFound(req.path);
  res.send(fromDoc(resDoc));
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  authz.validate(req, res, SEGMENT);
  // TODO add authz when user other than siteacct owner can creat orgs
  const uId = res.locals.uId;
  const saId = await siteacct.findIdByUser(uId);
  if (!saId) throw new InternalError({message: `missing siteacct for user ${uId}`});
  const reqDoc = await toValidDoc(req.body, uId);
  await applyPostLimits(reqDoc);
  const resDoc = await reqDoc.save();
  res.send(fromDoc(resDoc));
}));
