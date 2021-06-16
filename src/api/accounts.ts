import * as base from './base';
import * as desc from './desc';
import * as actt from './actt';

export type CloseGet = {
  id: number;
  fnId: number;
  bal: number;
};

export type Get = base.Get & {
  oId: string;
  num: number;
  name: string;
  begAt: number;
  desc: desc.Get;
  sumId?: string;
  catId?: number;
  isCr?: boolean;
  clos: CloseGet[];
  actts: actt.Get[];
};
