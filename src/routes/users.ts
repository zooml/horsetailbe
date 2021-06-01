import express, {Request, Response} from 'express';
import { trimOrUndef } from '../utils/util';
import modelRoute from '../controllers/modelroute';
import { Doc, Model, USERSTATES_BY_TAG, encryptPswd } from '../models/user';
import {logRes} from '../platform/logger';
import { InternalError } from '../common/apperrs';
import { sessionClear } from './session';
import * as siteaccts from './siteaccts';
import * as rsc from '../controllers/rsc';
import { validStr } from '../common/validator';
import LIMITS from '../common/limits';
import * as descs from './descs';
import * as bases from './bases';

export const SEGMENT = 'users';
export const router = express.Router();

const POST_RSC_DEF: rsc.Def = {
  email: validStr.bind(LIMITS.fields.email, true),
  pswd: validStr.bind(LIMITS.fields.pswd, true),
  fName: validStr.bind(LIMITS.fields.fName, true),
  lName: validStr.bind(LIMITS.fields.lName, true),
  desc: rsc.validator.bind(descs.POST_RSC_DEF, 'desc')
};

type GetRsc = bases.Rsc & {
  id: string;
  email: string;
  pswd: string;
  fName: string;
  lName?: string;
  st: number;
  desc: descs.GetRsc;
};

const toDoc = async (o: {[key: string]: any}) => new Model({
  email: trimOrUndef(o.email)?.toLowerCase(),
  ePswd: await encryptPswd(o.pswd),
  fName: trimOrUndef(o.fName),
  lName: trimOrUndef(o.lName),
  st: USERSTATES_BY_TAG.ACTIVE.id, // TODO
  note: trimOrUndef(o.note)
});

const fromDoc = (o: Doc) => bases.fromDoc(o, {
  id: o._id.toString(),
  email: o.email,
  fName: o.fName,
  lName: o.lName,
  st: o.st,
  desc: descs.fromDoc(o.desc),
});

const validate = (o: Doc) => {
  validator(o);
  // TODO name, ....
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  if (req.query.ses) {
    const resDoc = await Model.findById(res.locals.uId);
    if (!resDoc) throw new InternalError({message: `session valid but no user ${res.locals.uId}`})
    res.send([fromDoc(resDoc)]);
  } else {
    res.send([]); // TODO return all in org?
  }
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = await toDoc(req.body);
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  siteaccts.create(resDoc._id); // TODO move to email confirm
  sessionClear(res)
    .send(fromDoc(resDoc));
  logRes(res);
}));
