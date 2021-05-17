import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {Siteacct, siteacctModel} from '../models/siteacct';
import {logRes} from '../controllers/logger';

const toDoc = (o: {[key: string]: any}, uId: string): Siteacct => new siteacctModel({
  uId,
  name: trimOrUndef(o.name),
  note: trimOrUndef(o.note)
});

const fromDoc = (o: Siteacct) => ({
  uId: o.uId,
  oIds: o.oIds,
  name: o.name,
  note: o.note
});

const validate = (o: Siteacct) => {
  // TODO saId, uId
  // TODO limit on num orgs/user
};

const router = express.Router();

router.get('/', modelRoute(async (req: Request, res: Response) => {
  // TODO get by uId
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = toDoc(req.body, res.locals.uId);
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
  logRes(res);
}));