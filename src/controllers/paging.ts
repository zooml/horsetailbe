import {Request, Response} from 'express';
import { toInt } from '../common/validators';
import qryext from './qryext';

export const HDR_NPAGE = 'X-NPage';
export const QRY_PAGE = 'page';
export const QRY_CNT = 'cnt';
export const CNT_MAX = 200;
const SEP_CHAR = '|';
const ESC_CHAR = '\\';

export type IdxVal = number | string | Date;

export type FldTyps = {[k: string]: 'n' | 's' | 'D';}; // in IdxVal order

const extractCnt = (req: Request): number => {
  const cnt = qryext(req, QRY_CNT);
  const n = cnt ? toInt(cnt, `${QRY_CNT} query param`) : CNT_MAX;
  return CNT_MAX < n ? CNT_MAX : n;
};

const escStr = (s: string) => {
  let r = '';
  let n = 0;
  while (true) {
    const i = s.indexOf(SEP_CHAR, n);
    if (i < 0) return r + s.substring(n);
    r += s.substring(n, i);
    r += ESC_CHAR + SEP_CHAR;
    n = i + 1;
  }
};

const split = (s: string): string[] => {
  const res = [];
  let r = '';
  let n = 0;
  while (true) {
    const i = s.indexOf(SEP_CHAR, n);
    if (i < 0) {
      r += s.substring(n);
      res.push(r);
      return res;
    }
    if (i === 0 || s.charAt(i - 1) !== ESC_CHAR) { // end of val
      r += s.substring(n, i);
      res.push(r);
      r = '';
    } else { // escaped sep char
      r += s.substring(n, i - 1); // drop esc
      r += SEP_CHAR;
    }
    n = i + 1;
  }
};

const appendVal = (s: string, v: IdxVal): string => {
  if (s) s += SEP_CHAR;
  if (typeof v == 'number') return s + `${v}`;
  if (typeof v == 'string') return s + escStr(v);
  return s + `${v.getTime()}`;
};

export const insertKey = (req: Request, res: Response, cnt: number, last?: IdxVal[]): Response => {
  // last: values of last doc compound key fields in order
  const reqCnt = extractCnt(req);
  if (cnt < reqCnt || !last) return res; // assume at end, no more pages
  const key = last.reduce(appendVal, '') as string;
  const encoded = Buffer.from(key, 'ascii').toString('base64');
  return res.set(HDR_NPAGE, encoded);
};

export const extractKey = (req: Request, fts: FldTyps, dsc?: boolean): [{[k: string]: any}, number] => {
  // fts: types of compound key fields in order
  const cnt = extractCnt(req);
  const encoded = qryext(req, QRY_PAGE);
  if (!encoded) return [{}, cnt];
  // e.g.: >a || =a & >b || =a & =b & >c
  const key = Buffer.from(encoded, 'base64').toString('ascii');
  const vals = split(key);
  let prefix: {[k: string]: any} = {};
  const path = `${QRY_PAGE} query param`;
  const clauses = Object.entries(fts).reduce((p, [f, t], i) => {
    const v = t === 's'
      ? vals[i]
      : (t === 'n'
        ? toInt(vals[i], path)
        : new Date(toInt(vals[i], path)));
    const clause = {...prefix, [f]: {[dsc ? '$lt' : '$gt']: v}};
    p.push(clause);
    prefix[f] = v;
    return p;
  }, []);
  const flt = clauses.length === 1 ? clauses[0] : {$or: clauses};
  return [flt, cnt];
};