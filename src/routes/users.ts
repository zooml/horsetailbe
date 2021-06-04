import express, {Request, Response} from 'express';
import modelRoute from '../controllers/modelroute';
import { Doc, Model, USERSTATES_BY_TAG as USER_STATES, encryptPswd } from '../models/user';
import { InternalError } from '../common/apperrs';
import * as session from './session';
import * as siteacct from '../models/siteacct';
import { FIELDS } from '../common/limits';
import * as descs from './descs';
import * as rsc from './rsc';
import * as authz from './authz';

export const SEGMENT = 'users';
export const router = express.Router();

type Get = rsc.GetBase & {
  email: string;
  fName: string;
  lName?: string;
  st: number;
  desc: descs.Get;
};

const fromDoc = (doc: Doc): Get => ({
  ...rsc.fromDoc(doc),
  email: doc.email,
  fName: doc.fName,
  lName: doc.lName,
  st: doc.st,
  desc: descs.fromDoc(doc.desc),
});

const POST_DEF: rsc.Def = [FIELDS.email, FIELDS.pswd, FIELDS.fName, FIELDS.lName, FIELDS.desc];

const toDoc = async (o: {[k: string]: any}, uId: string) => new Model({
  email: o.email,
  ePswd: await encryptPswd(o.pswd),
  fName: o.fName,
  lName: o.lName,
  st: USER_STATES.ACTIVE.id, // TODO user state
  desc: descs.toDoc(o.desc, uId)
});

const toValidDoc = async (o: {[k: string]: any}, uId: string) => {
  const post = {...o};
  rsc.normAndValid(POST_DEF, post, {desc: descs.POST_DEF});
  return await toDoc(post, uId);
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  if (req.query.ses) {
    const resDoc = await Model.findById(res.locals.uId);
    if (!resDoc) throw new InternalError({message: `session valid but no user ${res.locals.uId}`})
    res.json([fromDoc(resDoc)]);
  } else {
    res.json([]); // TODO return all in org?
  }
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const reqDoc = await toValidDoc(req.body, res.locals.uId);
  const resDoc =  await reqDoc.save();
  siteacct.create(resDoc._id); // TODO move to email confirm
  session.clear(res)
    .json(fromDoc(resDoc));
}));
