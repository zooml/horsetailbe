import express, {Request, Response} from 'express';
import { trimOrUndef } from '../utils/util';
import modelRoute from '../controllers/modelroute';
import { Doc, Model, USERSTATES_BY_TAG } from '../models/user';
import {logRes} from '../platform/logger';
import { MissingError, InternalError } from '../common/apperrs';
import { CredentialsError, UserNotActive } from '../controllers/errors';
import bcrypt from 'bcrypt';
import { sessionClear } from './session';
import validator from '../common/validator';
import * as siteaccts from './siteaccts';

export const SEGMENT = 'users';
export const router = express.Router();

const salts = 10;

const encryptPswd = async (pswd: string) => {
  const s = trimOrUndef(pswd);
  if (!s) throw new MissingError('pswd');
  // TODO check length, max 30???
  return await bcrypt.hash(pswd, salts); // salt is in hash
}

const validatePswd = async (pswd: string, ePswd: string) => await bcrypt.compare(pswd, ePswd);

export const authnUser = async (email: string, pswd: string): Promise<Doc> => {
  const user = await Model.findOne({email});
  if (!user || !await validatePswd(pswd, user.ePswd)) throw new CredentialsError();
  if (user.st !== USERSTATES_BY_TAG.ACTIVE.id) throw new UserNotActive();
  return user;
};

const toDoc = async (o: {[key: string]: any}) => new Model({
  email: trimOrUndef(o.email)?.toLowerCase(),
  ePswd: await encryptPswd(o.pswd),
  fName: trimOrUndef(o.fName),
  lName: trimOrUndef(o.lName),
  st: USERSTATES_BY_TAG.ACTIVE.id, // TODO
  note: trimOrUndef(o.note)
});

const fromDoc = (o: Doc) => ({
  id: o._id,
  email: o.email,
  fName: o.fName,
  lName: o.lName,
  st: o.st,
  note: o.note,
  at: o.at,
  upAt: o.upAt,
  v: o.__v
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
