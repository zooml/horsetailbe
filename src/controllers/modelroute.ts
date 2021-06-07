import {Request, Response, NextFunction} from 'express';
import { AppError, CastError, DbValidationError, DupError } from '../common/apperrs';

// https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139
const decodeErr = (err: any) => {
  let error = err;
  if (!(err instanceof AppError)) {
    if (err.name === 'CastError') {
      error = new CastError(err.path, err.value);
    } else if (err.name === 'MongoError') {
      if (err.code === 11000) {
        // message: E11000 duplicate key error dup key: { : "a@b.co" }
        const m = err.message.match(/\{\s*:\s*(.*?)\s*\}/);
        error = new DupError('<index>', m ? m[1].replace(/"/g, '') : '<unknown>');
      }
    } else if (err.name === 'ValidationError') {
      // we should have caught these already
      const msgs = Object.values(err.errors).map((e: Error) => e.message);
      error = new DbValidationError(msgs);
    }
  }
  return error;
};

// TODO type
export default (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch((err: any) => next(decodeErr(err)));