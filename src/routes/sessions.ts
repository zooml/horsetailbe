import express, { Request, Response } from 'express';
import { sessionSet, sessionClear } from './session';
import { MissingError } from '../controllers/errors';
import modelRoute from '../controllers/modelroute';
import { authnUser } from './users';
import * as authz from './authz';

export const SEGMENT = 'sessions';
export const router = express.Router();

router.post('/', modelRoute(async (req: Request, res: Response) => {
  authz.validate(req, res, SEGMENT);
  const ses = req.body;
  if (!ses.email) throw new MissingError('email');
  if (!ses.pswd) throw new MissingError('pswd');
  const user = await authnUser(ses.email, ses.pswd);
  sessionSet(req, res, user._id)
    .status(204)
    .send();
}));

router.delete('/', modelRoute(async (req: Request, res: Response) => {
  authz.validate(req, res, SEGMENT);
  sessionClear(res)
    .status(204)
    .send();
}));
