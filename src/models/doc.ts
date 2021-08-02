import { Document, Types } from 'mongoose';
import { AppError, CastError, DupError, DbValidationError, FmtError } from '../common/apperrs';
import { tryCatch } from '../utils/util';
import { MongoError } from 'mongodb';

export type ObjId = Types.ObjectId;

export type FFlds = {[k: string]: any}; // general filter type

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
    } else if (err instanceof MongoError) {
      if (err.code === 11000) {
        // message: E11000 duplicate key error dup key: { : "a@b.co" }
        // E11000 duplicate key error collection: horsetaildb.users index: email_1 dup key: { email: "a@b.co" }
        // looks like keyValue field is going away, so don't expect it:
        //   https://jira.mongodb.org/browse/SERVER-50454

        // TODO compound key, e.g. {foo: "abc", bar: 2}??? test with org name
        const m = err.message.match(/\{\s*(\S*?):\s*(.*?)\s*\}/);

        let v = m ? m[2].replace(/"/g, '') : '<unknown>';
        // compound key index, remove the objid since that doesn't help
        if (v.startsWith('ObjectId')) v = v.replace(/ObjectId.*?:\s/, '');
        error = new DupError(m[1] ? m[1] : '<index>', v);
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