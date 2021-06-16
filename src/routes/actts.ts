import * as descs from './descs';
import * as actt from '../models/actt';
import { fromDate } from '../common/acctdate';
import { Get } from '../api/actt';

export const fromDoc = (f: actt.Flds): Get => ({
  at: fromDate(f.at),
  isAct: f.isAct,
  desc: descs.fromFlds(f.desc)
});