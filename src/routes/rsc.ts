import * as doc from '../models/doc';
import { fromDate, toDate } from '../utils/svrdate';
import { isArr, isObj, isStr, toBool, validBool, validChoice, validCurrency, validDate, validNum, validStr } from '../common/validators';
import { CastError, ExtraFldsError, InternalError, MaxError, MinError, MissingError } from '../common/apperrs';
import { ArrLimit, BoolLimit, ChoiceLimit, CurrencyLimit, DateLimit, Limit, NumLimit, ObjIdLimit, StrLimit } from '../common/limits';
import { trimOrUndef } from '../utils/util';
import { Types } from 'mongoose';
import * as base from '../api/base';

export type Def = Limit[];

export const normAndValidObjId = (lim: ObjIdLimit, v: any): doc.ObjId | undefined => {
  if (v === undefined || (typeof v === 'string' && !v)) {
    if (!lim.req) return undefined;
    throw new MissingError(lim.name);
  }
  if (v instanceof Types.ObjectId) return v;
  if (!isStr(v)) throw new CastError(lim.name, v);
  return doc.toObjId(v, lim.name);
};

const validArray = (lim: ArrLimit, v: any, def?: Def): boolean => {
  if (v === undefined) {
    if (!lim.req) return true;
    throw new MissingError(lim.name);
  }
  if (!isArr(v)) throw new CastError(lim.name, v)
  if (lim.min && v.length < lim.min) throw new MinError(lim.name, lim.min);
  if (lim.max < v.length) throw new MaxError(lim.name, lim.max);
  if (def) v.forEach((o: {[k: string]: any}) => normAndValidObj(def, o, {}, lim.name));
  return true;
}

export const normAndValidObj = (def: Def, o: {[k: string]: any}, subDefs?: {[k: string]: Def}, path?: string) => {
  if (!o) throw new MissingError(path ?? ''); // TODO implies all subs are required
  if (!isObj(o)) throw new CastError(path ?? '', '<not object>');
  let found = 0;
  for (const lim of def) {
    let v;
    if (lim.name in o) {
      v = o[lim.name];
      if (v === undefined) delete o[lim.name];
    }
    const vPrev = v;
    switch (lim.kind) {
      case 'string':
        v = trimOrUndef(v);
        validStr(lim as StrLimit, true, v);
        break;
      case 'number':
        validNum(lim as NumLimit, true, v);
        break;
      case 'boolean':
        validBool(lim as BoolLimit, true, v);
        v = toBool(v);
        break;
      case 'date':
        v = toDate(v);
        validDate(lim as DateLimit, true, v);
        break;
      case 'currency':
        validCurrency(lim as CurrencyLimit, true, v);
        break;
      case 'objectid':
        v = normAndValidObjId(lim as ObjIdLimit, v);
        break;
      case 'array':
        validArray(lim as ArrLimit, v, subDefs?.[lim.name]);
        break;
      case 'object':
        const subDef = subDefs?.[lim.name];
        if (!subDef) throw new InternalError({message: `unknown subobject limit ${lim.name}`});
        normAndValidObj(subDef, v, subDefs, lim.name);
        break;
      case 'choice':
        validChoice(lim as ChoiceLimit, true, v);
        break;
      default:
        throw new InternalError({message: `unknown limit kind ${lim.kind}`});
    }
    if (v !== vPrev) {
      if (v === undefined) delete o[lim.name];
      else o[lim.name] = v;
    }
    if (v !== undefined) ++found;
  }
  // check if any extra keys in input
  const oKeys = Object.keys(o);
  if (found !== oKeys.length) { // extra fld, find out which one
    for (const key of oKeys) {
      if (!def.some(df => df.name === key)) throw new ExtraFldsError(key); // TODO does not include path
    }
  }
}

export const normAndValid = (def: Def, o: {[k: string]: any}, subDefs?: {[k: string]: Def}) =>
  normAndValidObj(def, o, subDefs);

export const fromDoc = (d: doc.Doc): base.Get => ({
  id: d._id.toHexString(),
  at: fromDate(d.at),
  upAt: fromDate(d.upAt),
  v: d.__v
});
