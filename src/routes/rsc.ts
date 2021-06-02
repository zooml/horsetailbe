import * as doc from '../models/doc';
import { fromDate, toDate } from '../common/acctdate';
import { isObj, isStr, validDate, validNum, validStr } from '../common/validators';
import { CastError, ExtraFldsError, InternalError, MissingError } from '../common/apperrs';
import { DateLimit, Limit, NumLimit, ObjIdLimit, StrLimit } from '../common/limits';
import { trimOrUndef } from '../utils/util';
import { ObjectId} from 'mongoose';

export type GetBase = {
  id: string;
  at: number;
  upAt: number;
  v: number;
};

export type Def = Limit[];

export const normAndValidObjId = (lim: ObjIdLimit, v: any): ObjectId | undefined => {
  if (v === undefined) {
    if (!lim.req) return undefined;
    throw new MissingError(lim.name);
  }
  if (!isStr(v)) { // should not be converted to mongo ObjectId yet
    throw new CastError(lim.name, v);
  }
  return doc.toObjId(v); // TODO test does this throw on bad format?????????
};

export const normAndValidObj = (rsc: Def, o: {[k: string]: any}, subDefs?: {[k: string]: Def}, path?: string) => {
  if (!o) throw new MissingError(path ?? ''); // TODO implies all subs are required
  if (!isObj(o)) throw new CastError(path ?? '', '<not object>');
  let found = 0;
  for (const lim of rsc) {
    let v = o[lim.name];
    if (v !== undefined) ++found;
    switch (lim.kind) {
      case 'string':
        v = trimOrUndef(v);
        o[lim.name] = v;
        validStr(lim as StrLimit, true, v);
        break;
      case 'number':
        validNum(lim as NumLimit, true, v);
        break;
      case 'date':
        v = toDate(v);
        o[lim.name] = v;
        validDate(lim as DateLimit, true, v);
        break;
      case 'objectid':
        v = normAndValidObjId(lim as ObjIdLimit, v);
        if (v) o[lim.name] = v;
        break;
      case 'object':
        const subDef = subDefs ? subDefs[lim.name] : undefined;
        if (!subDef) throw new InternalError({message: `unknown limit kind ${lim.kind}`});
        normAndValidObj(subDef, v, subDefs, lim.name);
        break;
      default:
        throw new InternalError({message: `unknown limit kind ${lim.kind}`});
    }
  }
  // check if any extra keys in input
  const oKeys = Object.keys(o);
  if (found != oKeys.length) { // extra fld, find out which one
    for (const key of oKeys) {
      if (!(key in rsc)) throw new ExtraFldsError(key); // TODO does not include path
    }
  }
}

export const normAndValid = (rsc: Def, o: {[k: string]: any}, subDefs?: {[k: string]: Def}) => normAndValidObj(rsc, o, subDefs);

export const fromDoc = (doc: doc.Base): GetBase => ({
  id: doc._id.toString(),
  at: fromDate(doc.at),
  upAt: fromDate(doc.upAt),
  v: doc.__v
});
