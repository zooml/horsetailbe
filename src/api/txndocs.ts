import * as base from './base';
import * as desc from './desc';

export type AmtGet = {
  acId: string;
  fnId: number;
  amt: number;
};

export type Get = base.Get & {
  oId: string;
  begAt: number;
  kind: number;
  desc: desc.Get;
  amts: AmtGet[],
  dueAt?: number;
};
