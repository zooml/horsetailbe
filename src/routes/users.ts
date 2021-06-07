import express, {Request, Response} from 'express';
import modelRoute from '../controllers/modelroute';
import { Doc, STATES, encryptPswd, CFlds, create, findById } from '../models/user';
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
  opts: {[k: string]: any};
  desc: descs.Get;
};

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    email: d.email,
    fName: d.fName,
    st: d.st,
    opts: d.opts,
    desc: descs.fromDoc(d.desc),
  };
  if (d.lName) g.lName = d.lName;
  return g;
};

const POST_DEF: rsc.Def = [FIELDS.email, FIELDS.pswd, FIELDS.fName, FIELDS.lName, FIELDS.desc];

const toCFlds = async (o: {[k: string]: any}, uId: string): Promise<CFlds> => {
  const f: CFlds = {
    email: o.email,
    ePswd: await encryptPswd(o.pswd),
    fName: o.fName,
    st: STATES.ACTIVE.id,
    opts: {},
    desc: descs.toFlds(o.desc, uId)
  };
  if (o.lName) f.lName = o.lName;
  return f;
};

const toValidCFlds = async (o: {[k: string]: any}, uId: string): Promise<CFlds> => {
  const post = {...o};
  if (!post.desc) post.desc = {};
  rsc.normAndValid(POST_DEF, post, {desc: descs.POST_DEF});
  return await toCFlds(post, uId);
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  if (res.locals.oId) {
    res.json([]); // TODO return all in org?
  } else {
    const resDoc = await findById(res.locals.uId);
    if (!resDoc) {
      session.clear(res);
      throw new InternalError({message: `session valid but no user ${res.locals.uId}`});
    }
    res.json([fromDoc(resDoc)]);
  }
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const f = await toValidCFlds(req.body, res.locals.uId);
  const resDoc =  await create(f);
  siteacct.create(resDoc._id); // TODO move to email confirm
  session.clear(res)
    .json(fromDoc(resDoc));
}));
