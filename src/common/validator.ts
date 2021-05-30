import { MaxError, InternalError, ValueError } from '../common/apperrs';
import limits from './limits';

// WARN in client
const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;

const fldPath = (fld: string, path: string[]) => `${path.join('.')}${path.length ? '.' : ''}${fld}`;

const throwValue = (fld: string, path: string[], val: any, msg: string): never => {
  throw new ValueError(fldPath(fld, path), val, msg);
};

const throwMax = (fld: string, path: string[], max: number) => {
  throw new MaxError(fldPath(fld, path), max);
};

const validStr = (fld: string, path: string[], val: string) => {
  const lim = limits.fields[fld];
  if (!lim) throw new InternalError({message: `no limits for ${fld}`});
  if (lim.max < val.length) throwMax(fld, path, lim.max);  
};

const validFld = (fld: string, path: string[], val: any) => {
  switch (fld) {
    case 'email': {
      if (!emailRegex.test(val)) throwValue(fld, path, val, 'invalid format');
      validStr(fld, path, val);
      break;
    }
    default:
      if (typeof val === 'string') {
        validStr(fld, path, val);
      } else if (typeof val === 'number') {
        // TODO number limits?????
      }
  }
};

const validArr = (arr: Array<any>, path: string[], depth: number) => {
  arr.forEach((val: any, i: number) => {
    if (Array.isArray(val)) {
      // array of arrays
      const fld = `${path.slice(0, path.length - depth).join('.')}${'.*'.repeat(depth + 1)}`;
      const max = limits.fldarrs[fld];
      // TODO error if not max???
      if (max && max < val.length) throwMax(fld, path, max);
      validArr(val, [...path, `${i}`], depth + 1);
    } else if (Object.prototype.toString.call(val) === '[object Object]') {
      validator(val, [...path, `${i}`]);
    } else {
      validFld(`${i}`, path, val);
    }
  });
};

const validator = (o: {[key: string]: any}, path: string[] = []) => {
  for (const [fld, val] of Object.entries(o)) {
    if (Array.isArray(val)) {
      const max = limits.fldarrs[fld];
      // TODO error if not max???
      if (max && max < val.length) throwMax(fld, path, max);
      validArr(val, [...path, fld], 0);
    } else if (Object.prototype.toString.call(val) === '[object Object]') {
      validator(val, [...path, fld]);
    } else {
      validFld(fld, path, val);
    }
  }
};

export default validator;