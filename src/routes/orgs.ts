import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {Org, orgModel, orgRoles} from '../models/org';
import validator from '../controllers/validator';
import { NotFound } from 'http-errors';

const toDoc = (o: {[key: string]: any}, uId: string): Org => new orgModel({
  saId: trimOrUndef(o.saId),
  name: trimOrUndef(o.name),
  uId,
  note: trimOrUndef(o.note)
});

const fromDoc = (o: Org) => ({
  id: o._id,
  saId: o.saId,
  name: o.name,
  uId: o.uId,
  note: o.note,
  users: o.users,
  funds: o.funds,
  closes: o.closes,
  at: o.at,
  upAt: o.upAt,
  v: o.__v
});

const validate = (o: Org) => {
  validator(o);
  // TODO saId, uId
  // TODO limit on num orgs/user
};

const router = express.Router();

router.get('/', modelRoute(async (req: Request, res: Response) => {
  const resDocs = await orgModel.find({'users.id': res.locals.uId}, {id: 1, saId: 1, name: 1, 'users.$': 1});
  // TODO wrong path, test if getting by SA
  res.send(resDocs?.map(fromDoc) ?? []);
}));

router.get('/:id', modelRoute(async (req: Request, res: Response) => {
  const resDoc = await orgModel.findById(req.params.id);
  if (!resDoc) throw new NotFound(req.path);
  // TODO don't include users unless admin role
  res.send(fromDoc(resDoc));
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = toDoc(req.body, res.locals.uId);
  reqDoc.users = [{
    id: res.locals.uId,
    roles: [{
      id: orgRoles.ADMIN,
      uId: res.locals.uId,
      at: new Date()
    }]
  }];
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
}));

export default router;
