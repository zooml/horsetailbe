import { BaseDoc } from '../models/basedoc';
import { toNumSecs } from '../common/acctdate';

export type Rsc = {
  at: number;
  upAt: number;
  v: number;
};

export const fromDoc = (doc: BaseDoc & {__v: number}, rsc: Rsc) => {
  rsc.at = toNumSecs(doc.at);
  rsc.upAt = toNumSecs(doc.upAt);
  rsc.v = doc.__v;
  return rsc;
};