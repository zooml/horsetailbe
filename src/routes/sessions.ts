import express, { Request, Response } from 'express';
import * as session from './session';
import { MissingError } from '../common/apperrs';
import modelRoute from '../controllers/modelroute';
import { authn as authnUser } from '../models/user';
import * as authz from './authz';

export const SEGMENT = 'sessions';
export const router = express.Router();

router.post('/', modelRoute(async (req: Request, res: Response) => {
  // no need to authz.validate, this is authn
  const ses = req.body;
  if (!ses.email) throw new MissingError('email');
  if (!ses.pswd) throw new MissingError('pswd');
  const user = await authnUser(ses.email, ses.pswd);
  session.set(req, res, user._id)
    .status(204)
    .json();
}));

router.delete('/', modelRoute(async (req: Request, res: Response) => {
  // no need to authz.validate, this is authn
  session.clear(res)
    .status(204)
    .json();
}));
