import {Request, Response, NextFunction} from 'express';

export default (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch((err: any) => next(err));