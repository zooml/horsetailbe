import {Request, Response, NextFunction} from 'express';
import { AppError, CastError, DupError } from '../common/apperrs';

const decodeErr = (err: any) => {
  let error = err;
  if (!(err instanceof AppError)) {
    if (err.name === 'CastError') {
      error = new CastError(err.path, err.value);
    } else if (err.name === 'MongoError') {
      if (err.code === 11000) {
        const m = err.message.match(/\{\s*:\s*(.*?)\s*\}/);
        error = new DupError('<index>', m ? m[1].replace(/"/g, '') : '<unknown>');
      }
    }

    // MongoError
    // message: E11000 duplicate key error dup key: { : "a@b.co" }
    // code: 11000
    // err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

    // TODO other db handlers from https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139

  }
  return error;
};

// TODO type
export default (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch((err: any) => next(decodeErr(err)));