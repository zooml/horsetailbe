import { CastError, DayBegError, FmtError, MaxError, MinError, MissingError } from "./apperrs";
import { BoolLimit, DateLimit, NumLimit, StrLimit } from "./limits";
import * as acctdate from './acctdate';

export const isStr = (v: any) => typeof v === 'string';
export const isNum = (v: any) => typeof v === 'number';
export const isDate = (v: any) => v instanceof Date;
export const isArr = (v: any) => Array.isArray(v);
export const isObj = (v: any) => Object.prototype.toString.call(v) === '[object Object]';

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

export const toBool = (v: any): boolean | undefined => {
  if (v === undefined) return undefined;
  if (typeof v === 'boolean') return v;
  if (isNum(v)) return v === 0 ? false : (v === 1 ? true : undefined);
  if (isStr(v)) return v === 'false' ? false : (v === 'true' ? true : undefined);
  return undefined;
};

export const validBool = (lim: BoolLimit, thro: boolean, v: any) => {
  if (v === undefined) {
    if (!lim.req) return true;
    if (thro) throw new MissingError(lim.name);
    return false;
  }
  if (toBool(v) === undefined) {
    if (thro) throw new CastError(lim.name, v);
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
  return true;
};
