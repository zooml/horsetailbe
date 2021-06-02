import express, { Request, Response } from 'express';
import { trimOrUndef } from '../utils/util';
import modelRoute from '../controllers/modelroute';
import { Doc, Model } from '../models/siteacct';
import * as desc from './descs';
import { toObjId } from '../models/doc';

export const SEGMENT = 'siteaccts';
export const router = express.Router();

const toDoc = (o: {[k: string]: any}, uId: string): Doc => new Model({
  name: trimOrUndef(o.name),
  desc: desc.toDoc(o.desc, uId)
});

const fromDoc = (o: Doc) => ({
  name: o.name,
  desc: o.desc
});

const validate = (o: Doc) => {
  // TODO saId, uId
  // TODO limit on num orgs/user
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  // TODO get by uId
}));

// TODO needed??? router.post('/', modelRoute(async (req: Request, res: Response) => {
//   const reqDoc = toDoc(req.body, res.locals.uId);
//   validate(reqDoc);
//   const resDoc =  await reqDoc.save();
//   res.send(fromDoc(resDoc));
//   logRes(res);
// }));
