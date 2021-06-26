import express, { Request, Response } from 'express';
import * as session from './session';
import { MissingError } from '../common/apperrs';
import * as user from '../models/user';
import ctchEx from '../controllers/ctchex';

export const SEGMENT = 'sessions';
export const router = express.Router();

router.post('/', ctchEx(async (req: Request, res: Response) => {
  // no need to authz.validate, this is authn
  const ses = req.body;
  // SECURITY: provide only minimal info (e.g. no length of pswd)
  if (!ses.email) throw new MissingError('email');
  if (!ses.pswd) throw new MissingError('pswd');
  const u = await user.authn(ses.email, ses.pswd);
  session.set(req, res, u._id.toHexString())
    .status(204)
    .send();
}));

router.delete('/', ctchEx(async (req: Request, res: Response) => {
  // no need to authz.validate, this is authn
  session.clear(res)
    .status(204)
    .send();
}));
