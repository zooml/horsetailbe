import crypto from 'crypto';
import LIMITS from '../common/limits';

export const trimOrUndef = (v: any): any => {
  if (!v || typeof v !== 'string') return v;
  const t = v.trim();
  return t ? t : undefined;
};

export const toUniqueTs = (date: Date) => {
  const time = date.toISOString().replace(/[-:.TZ]/, ''); // 2011-10-05T14:48:00.000Z -> 20111005144800000
  const max = 36 * 36 * 36 * 36 * 36; // 5 base-36 digits
  const zeros = '00000';
  const rand = Math.floor(Math.random() * max).toString(36); // no leading 0's
  return `${time}-${zeros.substr(rand.length)}${rand}`;
};

const digest = (s: string): string => {
  const algo = crypto.createHmac('md5', LIMITS.digest.keys[0]);
  algo.update(s);
  return algo.digest('base64');
}

const normalizePrefix = (prefix: string): string => {
  let p = prefix;
  if (!p || p === '/') return '/';
  if (p.charAt(0) !== '/') p = `/${p}`;
  return (p.charAt(p.length - 1) === '/') ? p : `${p}/`;
};

export const extractSegs = (prefix: string, path: string) => {
  const pre = normalizePrefix(prefix);
  if (path.startsWith(pre)) {
    const rem = path.substring(pre.length);
    if (rem) {
      const a = rem.split('/', 3);
      return [a[0], a[1] || ''];
    }
  }
  return ['', ''];
}

export const parseAndMatchPath = (prefix: string, path: string, ...segs: string[]): [number, string] => {
  const [rsc, id] = extractSegs(prefix, path);
  for (let i = 0; i < segs.length; ++i) {
    if (segs[i] === rsc) return [i + 1, id];
  }
  return [0, ''];
};

export const tryCatch = async <T>(f: () => Promise<T>, hndlErr: (e: Error) => never): Promise<T> => {
  try {
    return await f();
  } catch (e) {hndlErr(e);}
};