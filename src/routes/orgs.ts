import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {Doc, Model, STD_ROLE_IDS} from '../models/org';
import validator from '../common/validator';
import { NotFound } from 'http-errors';
import * as desc from './descs';
import * as authz from './authz';
import * as siteaccts from './siteaccts';
import { InternalError } from '../common/apperrs';

export const SEGMENT = 'orgs';
export const router = express.Router();

const toDoc = (o: {[key: string]: any}, uId: string): Doc => new Model({
  name: trimOrUndef(o.name),
  desc: desc.toDoc(o.desc, uId)
});

const fromDoc = (o: Doc) => ({
  id: o._id,
  saId: o.saId,
  name: o.name,
  desc: o.desc,
  users: o.users,
  funds: o.funds,
  clos: o.clos,
  at: o.at,
  upAt: o.upAt,
  v: o.__v
});

const validate = (o: Doc) => {
  validator(o);
  // TODO saId, uId
  // TODO limit on num orgs/user
};

export const findRolesForUser = async (res: Response) => {
  const org = await Model.findOne(
    {_id: res.locals.oId, 'users.id': {uId: res.locals.uId}},
    {'users.$': 1});
  return org?.users[0].roles.map(r => r.id) ?? [];
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
    // no authz required, every user can create their own orgs
    // TODO add authz when user other than siteacct owner can creat orgs


  // TODO siteacct????? and authz
  // TODO limit # of orgs/siteacct
  const uId = res.locals.uId;
  const saId = await siteaccts.findIdByUser(uId);
  if (!saId) throw new InternalError({message: `missing siteacct for user ${uId}`});
  const at = new Date();
  const reqDoc = toDoc(req.body, uId);
  reqDoc.saId = saId;
  reqDoc.users = [{
    id: res.locals.uId,
    roles: [{
      id: STD_ROLE_IDS.SUPER,
      uId,
      at}]}];
  reqDoc.funds = [{
    id: 1,
    tag: 'general',
    at,
    desc: {uId},
    actts: []}];
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
}));
