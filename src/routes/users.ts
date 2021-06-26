import express, {Request, Response} from 'express';
import { Doc, STATES, encryptPswd, CFlds, create, findById } from '../models/user';
import { InternalError } from '../common/apperrs';
import * as session from './session';
import * as siteaccts from './siteaccts';
import { FIELDS } from '../common/limits';
import * as descs from './descs';
import * as rsc from './rsc';
import * as authz from './authz';
import * as doc from '../models/doc';
import { validStr } from '../common/validators';
import ctchEx from '../controllers/ctchex';
import { Get } from '../api/users';
import { logInfo } from '../platform/logger';

export const SEGMENT = 'users';
export const router = express.Router();

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    email: d.email,
    fName: d.fName,
    st: d.st,
    opts: d.opts ?? {},
    desc: descs.fromFlds(d.desc),
  };
  if (d.lName) g.lName = d.lName;
  return g;
};

const POST_DEF: rsc.Def = [FIELDS.email, FIELDS.ePswd, FIELDS.fName, FIELDS.lName, FIELDS.st, FIELDS.opts, FIELDS.desc];
const OPTS_DEF: rsc.Def = [];

const toCFlds = async (o: {[k: string]: any}, uId: doc.ObjId | undefined, pswd: string): Promise<CFlds> => {
  const f: CFlds = {
    email: o.email,
    ePswd: await encryptPswd(pswd),
    fName: o.fName,
    st: STATES.ACTIVE.id,
    opts: {},
    desc: descs.toFlds(o.desc, uId)
  };
  if (o.lName) f.lName = o.lName;
  return f;
};

const toValidCFlds = async (o: {[k: string]: any}, uId: doc.ObjId | undefined): Promise<CFlds> => {
  const pswd = o.pswd; // validate here since converted to ePswd in toCFlds
  delete o.pswd;
  validStr(FIELDS.pswd, true, pswd);
  const f = await toCFlds(o, uId, pswd);
  rsc.normAndValid(POST_DEF, f, {desc: descs.POST_DEF, opts: OPTS_DEF});
  return f;
};

router.get('/', ctchEx(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const uId: doc.ObjId = res.locals.uId;
  if (res.locals.oId) {
    // TODO only active users!!!!!!!
    res.json([]); // TODO return all in org
  } else {
    const resDoc = await findById(uId);
    if (!resDoc) {
      session.clear(res);
      throw new InternalError({message: `session valid but no user ${res.locals.uId}`});
    }
    res.json([fromDoc(resDoc)]);
  }
}));

router.post('/', ctchEx(async (req: Request, res: Response) => {
  logInfo(JSON.stringify(req.body));
  await authz.validate(req, res, SEGMENT);
  // res.locals.uId will exist if created for invitation
  const uId: doc.ObjId | undefined = res.locals.uId;
  const f = await toValidCFlds(req.body, uId);
  const resDoc =  await create(f);
  await siteaccts.create(resDoc._id, f.fName); // TODO move to email confirm
  session.clear(res)
    .json(fromDoc(resDoc));
}));
