import {Request, Response, NextFunction} from 'express';
import {AppError, CastError} from './errors';

const decodeErr = (err: any) => {
  let error = err;
  if (!(err instanceof AppError)) {
    if (err.name === 'CastError') error = new CastError(err.path, err.value);

    // TODO other db handlers from https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139

  }
  return error;
};

// TODO type
export default (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch((err: any) => next(decodeErr(err)));