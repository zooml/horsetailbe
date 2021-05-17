import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {Org, orgModel} from '../models/org';
import {logRes} from '../controllers/logger';
import validator from '../controllers/validator';

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
  const resDocs = await orgModel.find({'users.id': res.locals.uId});
  // TODO wrong path, test if getting by SA
  res.send(resDocs?.map(fromDoc) ?? []);
  logRes(res);
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = toDoc(req.body, res.locals.uId);
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
  logRes(res);
}));

export default router;
