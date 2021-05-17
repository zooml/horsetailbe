import crypto from 'crypto';
import limits from '../controllers/limits';

export const trimOrUndef = (s: string | undefined): string | undefined => {
  const t = s?.trim();
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
  const algo = crypto.createHmac('md5', limits.digest.keys[0]);
  algo.update(s);
  return algo.digest('base64');
}
