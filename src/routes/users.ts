import express, {Request, Response} from 'express';
import { trimOrUndef } from '../utils/util';
import modelRoute from '../controllers/modelroute';
import { User, userModel, userStates } from '../models/user';
import {logRes} from '../controllers/logger';
import { MissingError, CredentialsError, ServerError, UserNotActive } from '../controllers/errors';
import bcrypt from 'bcrypt';
import { sessionClear } from '../controllers/session';
import validator from '../controllers/validator';

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
  if (user.st !== userStates.ACTIVE.id) throw new UserNotActive();
  return user;
};

const toDoc = async (o: {[key: string]: any}) => new userModel({
  email: trimOrUndef(o.email)?.toLowerCase(),
  ePswd: await encryptPswd(o.pswd),
  fName: trimOrUndef(o.fName),
  lName: trimOrUndef(o.lName),
  st: userStates.ACTIVE.id, // TODO
  note: trimOrUndef(o.note)
});

const fromDoc = (o: User) => ({
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

const validate = (o: User) => {
  validator(o);
  // TODO name, ....
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  if (req.query.ses) {
    const resDoc = await userModel.findById(res.locals.uId);
    if (!resDoc) throw new ServerError({message: `session valid but no user ${res.locals.uId}`})
    res.send([fromDoc(resDoc)]);
  } else {
    res.send([]); // TODO return all in org?
  }
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
