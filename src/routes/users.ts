import express, {Request, Response} from 'express';
import {trimOrUndef} from '../utils/util';
import modelRoute from '../controllers/modelroute';
import {User, userModel} from '../models/user';
import {logRes} from '../controllers/logger';
import { MissingError, CredentialsError } from '../controllers/errors';
import bcrypt from 'bcrypt';
import { sessionClear } from '../controllers/session';
import validator from '../controllers/validator';
import { NotFound } from '../controllers/errors';

const router = express.Router();

const salts = 10;

const encryptPswd = async (pswd: string) => {
  const s = trimOrUndef(pswd);
  if (!s) throw new MissingError('pswd');
  // TODO check length, max 30???
  return await bcrypt.hash(pswd, salts); // salt is in hash
}

export const authnUser = async (email: string, pswd: string): Promise<User> => {
  const user = await userModel.findOne({email});
  if (!user || !await bcrypt.compare(pswd, user.ePswd.valueOf())) throw new CredentialsError();
  return user;
};

const toDoc = async (o: {[key: string]: any}) => new userModel({
  email: trimOrUndef(o.email)?.toLowerCase(),
  ePswd: await encryptPswd(o.pswd),
  fName: trimOrUndef(o.fName),
  lName: trimOrUndef(o.lName),
  isAct: true,
  note: trimOrUndef(o.note)
});

const fromDoc = (o: User) => ({
  id: o._id,
  email: o.email,
  fName: o.fName,
  lName: o.lName,
  isAct: o.isAct,
  note: o.note,
  at: o.at,
  upAt: o.upAt,
  v: o.__v
});

const validate = (o: User) => {
  validator(o);
  // TODO name, ....
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  const resDoc = await userModel.findOne({email: req.query.email.toString()});
  if (!resDoc) throw new NotFound(req.path); // TODO msg path is '/60a279e3336b3611bb41512f'
  res.send(fromDoc(resDoc));
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = await toDoc(req.body);
  validate(reqDoc);
  const resDoc =  await reqDoc.save();
  sessionClear(res)
    .send(fromDoc(resDoc));
  logRes(res);
}));

export default router;
