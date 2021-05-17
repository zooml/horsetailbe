import express, {Request, Response} from 'express';
import { sessionSet, sessionClear } from '../controllers/session';
import { MissingError } from '../controllers/errors';
import modelRoute from '../controllers/modelroute';
import {authnUser} from './users';

const router = express.Router();

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const ses = req.body;
  if (!ses.email) throw new MissingError('email');
  if (!ses.pswd) throw new MissingError('pswd');
  const user = await authnUser(ses.email, ses.pswd);
  sessionSet(req, res, user._id)
    .status(204)
    .send();
}));

router.delete('/', modelRoute(async (req: Request, res: Response) => {
  sessionClear(res)
    .status(204)
    .send();
}));

export default router;
