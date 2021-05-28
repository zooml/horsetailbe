import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {Doc, Model, ROLES} from '../models/org';
import validator from '../controllers/validator';
import { NotFound } from 'http-errors';
import * as desc from './desc';

export const SEGMENT = 'orgs';
export const router = express.Router();

const toDoc = (o: {[key: string]: any}, uId: string): Doc => new Model({
  saId: trimOrUndef(o.saId),
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
  closes: o.closes,
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
  const resDocs = await Model.find({'users.id': res.locals.uId}, {id: 1, saId: 1, name: 1, 'users.$': 1});
  // TODO wrong path, test if getting by SA
  res.send(resDocs?.map(fromDoc) ?? []);
}));

router.get('/:id', modelRoute(async (req: Request, res: Response) => {
  const resDoc = await Model.findById(req.params.id);
  if (!resDoc) throw new NotFound(req.path);
  // TODO don't include users unless admin role
  res.send(fromDoc(resDoc));
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {

  // TODO siteacct????? 
  // TODO limit # of orgs/siteacct

  const reqDoc = toDoc(req.body, res.locals.uId);
  reqDoc.users = [{
    id: res.locals.uId,
    roles: [{
      id: ROLES.ADMIN,
      uId: res.locals.uId,
      at: new Date()
    }]
  }];
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
}));
