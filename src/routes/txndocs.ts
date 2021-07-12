import express, { Request, Response } from 'express';
import * as rsc from './rsc';
import { Get } from '../api/txndocs';
import * as descs from './descs';
import * as authz from './authz';
import { AmtFlds, Doc } from '../models/txndoc';
import { fromDate } from '../utils/svrdate';

export const SEGMENT = 'txndocs';
export const router = express.Router();

const fromAmtFlds = (f: AmtFlds) => ({
  acId: f.acId.toHexString(),
  fnId: f.fnId,
  amt: f.amt
});

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    oId: d.oId.toHexString(),
    begAt: fromDate(d.begAt),
    kind: d.kind,
    desc: descs.fromFlds(d.desc),
    amts: d.amts.map(fromAmtFlds)
  };
  if (d.dueAt) g.dueAt = fromDate(d.dueAt);
  return g;
};

