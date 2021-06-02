import * as descs from './descs';
import * as acttgl from '../models/acttgl';
import { fromDate } from '../common/acctdate';

export type Get = {
  at: number;
  isAct: boolean;
  desc: descs.Get;
};

export const fromDoc = (doc: acttgl.Doc): Get => ({
  at: fromDate(doc.at),
  isAct: doc.isAct,
  desc: descs.fromDoc(doc.desc)
});