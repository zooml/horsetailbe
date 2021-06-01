import { CastError, DayBegError, FmtError, MaxError, MinError, MissingError } from "./apperrs";
import { DateLimit, NumLimit, ObjIdLimit, StrLimit } from "./limits";
import * as acctdate from './acctdate';
export const isStr = (v: any) => typeof v === 'string';
export const isNum = (v: any) => typeof v === 'number';
export const isDate = (v: any) => v instanceof Date;
export const isArr = (v: any) => Array.isArray(v);
export const isObj = (v: any) => Object.prototype.toString.call(v) === '[object Object]';

// import { MaxError, InternalError, ValueError, MinError, FmtError } from '../common/apperrs';
// import limits from './limits';

// const fldPath = (fld: string, path: string[]) => `${path.join('.')}${path.length ? '.' : ''}${fld}`;

// const throwValue = (fld: string, path: string[], val: any, msg: string): never => {
//   throw new ValueError(fldPath(fld, path), val, msg);
// };

// const throwMax = (fld: string, path: string[], max: number) => {
//   throw new MaxError(fldPath(fld, path), max);
// };

// const throwMin = (fld: string, path: string[], max: number) => {
//   throw new MinError(fldPath(fld, path), max);
// };

export const validStr = (lim: StrLimit, thro: boolean, v: any) => {
  if (!v) { // '' or undefined is OK only if min === 0
    if (!lim.min) return true;
    if (thro) throw new MissingError(lim.name);
    return false;
  }
  if (!isStr(v)) {
    if (thro) throw new CastError(lim.name, v);
    return false;
  }
  if (lim.min && v.length < lim.min) {
    if (thro) throw new MinError(lim.name, lim.min);
    return false;
  }
  if (lim.max < v.length) {
    if (thro) throw new MaxError(lim.name, lim.max);
    return false;
  }
  if (lim.regex && !lim.regex.test(v)) {
    if (thro) throw new FmtError(lim.name);
    return false;
  }
  return true;
};

export const validNum = (lim: NumLimit, thro: boolean, v: any) => {
  if (v === undefined) {
    if (!lim.req) return true;
    if (thro) throw new MissingError(lim.name);
    return false;
  }
  if (!isNum(v)) {
    if (thro) throw new CastError(lim.name, v);
    return false;
  }
  if (lim.min && v < lim.min) {
    if (thro) throw new MinError(lim.name, lim.min);
    return false;
  }
  if (lim.max < v) {
    if (thro) throw new MaxError(lim.name, lim.max);
    return false;
  }
  return true;
};

export const validDate = (lim: DateLimit, thro: boolean, v: any) => {
  if (v === undefined) {
    if (!lim.req) return true;
    if (thro) throw new MissingError(lim.name);
    return false;
  }
  if (!isDate(v)) { // v should already be converted to Date
    if (thro) throw new CastError(lim.name, v);
    return false;
  }
  if (lim.dayBeg && !acctdate.validDayBeg(v)) {
    if (thro) throw new DayBegError(lim.name);
    return false;
  }
  if (lim.minToday && v < acctdate.today()) { 
    if (thro) throw new MinError(lim.name, 'now');
    return false;
  }
  return true;
};

export const validObjId = (lim: ObjIdLimit, thro: boolean, v: any) => {
  if (v === undefined) {
    if (!lim.req) return true;
    if (thro) throw new MissingError(lim.name);
    return false;
  }
  if (!isStr(v)) { // not converted to mongo ObjectId yet
    if (thro) throw new CastError(lim.name, v);
    return false;
  }
  return true;
};

// const validFld = (fld: string, path: string[], val: any) => {
//   if (typeof val === 'string') {
//     validStr(fld, path, val);
//   } else if (typeof val === 'number') {
//     // TODO number limits?????
//   }
// };

// const validArr = (arr: Array<any>, path: string[], depth: number) => {
//   arr.forEach((val: any, i: number) => {
//     if (Array.isArray(val)) {
//       // array of arrays
//       const fld = `${path.slice(0, path.length - depth).join('.')}${'.*'.repeat(depth + 1)}`;
//       const max = limits.fldarrs[fld];
//       // TODO error if not max???
//       if (max && max < val.length) throwMax(fld, path, max);
//       validArr(val, [...path, `${i}`], depth + 1);
//     } else if (Object.prototype.toString.call(val) === '[object Object]') {
//       validator(val, [...path, `${i}`]);
//     } else {
//       validFld(`${i}`, path, val);
//     }
//   });
// };

// const validator = (o: {[key: string]: any}, path: string[] = []) => {
//   for (const [fld, val] of Object.entries(o)) {
//     if (Array.isArray(val)) {
//       const max = limits.fldarrs[fld];
//       // TODO error if not max???
//       if (max && max < val.length) throwMax(fld, path, max);
//       validArr(val, [...path, fld], 0);
//     } else if (Object.prototype.toString.call(val) === '[object Object]') {
//       validator(val, [...path, fld]);
//     } else {
//       validFld(fld, path, val);
//     }
//   }
// };

// export default validator;