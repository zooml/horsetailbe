import { Document, Types } from 'mongoose';
import { AppError, CastError, DupError, DbValidationError, FmtError } from '../common/apperrs';
import { tryCatch } from '../utils/util';

export type ObjId = Types.ObjectId;

const regex = /^[0-9a-fA-F]{24}$/;
export const validObjId = (id: string, name: string) => {
  if (!id || !regex.test(id)) throw new FmtError(name, '24 hex chars');
}

export const toObjId = (id: string, name?: string): ObjId => {
  if (name) validObjId(id, name);
  return Types.ObjectId(id);
};

export type Flds = {
  readonly at: Date;
  readonly upAt: Date;
};

export type Doc = Flds & Document<ObjId>;

// https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139
const hndlErr = (err: any): never => {
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
      // e.g.: 'Org validation failed: funds.0.name: Path `name` is required.'
      const msgs = Object.values(err.errors).map((e: Error) => e.message);
      error = new DbValidationError(msgs);
    }
    // TODO any other errors? connection?
  }
  throw error;
};

export const op = async <T>(f: () => Promise<T>): Promise<T> => await tryCatch(f, hndlErr);