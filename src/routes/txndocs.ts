import express, { Request, Response } from 'express';
import * as rsc from './rsc';
import * as descs from './descs';
import * as authz from './authz';
import { AmtFlds, Doc } from '../models/txndoc';
import { fromDate, toDateStr } from '../common/acctdate';

export const SEGMENT = 'txndocs';
export const router = express.Router();

type AmtGet = {
  acId: string;
  fnId: number;
  amt: number;
};

const fromAmtFlds = (f: AmtFlds) => ({
  acId: f.acId.toHexString(),
  fnId: f.fnId,
  amt: f.amt
});

type Get = rsc.Get & {
  oId: string;
  begAt: number;
  kind: number;
  desc: descs.Get;
  amts: AmtGet[],
  dueAt?: number;
};

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

