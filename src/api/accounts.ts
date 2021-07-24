import * as base from './base';
import * as desc from './desc';
import * as actt from './actt';

export const CAT_IDS = Object.freeze({
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  REVENUE: 4,
  EXPENSE: 5
});

export type Category = {
  readonly id: number;
  readonly tag: string;
  readonly isCr: boolean;
};

export const CATEGORIES: {[key: number]: Category} = Object.freeze({
  [CAT_IDS.ASSET]: {id: CAT_IDS.ASSET, tag: 'assets', isCr: false},
  [CAT_IDS.LIABILITY]: {id: CAT_IDS.LIABILITY, tag: 'liabilities', isCr: true},
  [CAT_IDS.EQUITY]: {id: CAT_IDS.EQUITY, tag: 'equity', isCr: true},
  [CAT_IDS.REVENUE]: {id: CAT_IDS.REVENUE, tag: 'revenue', isCr: true},
  [CAT_IDS.EXPENSE]: {id: CAT_IDS.EXPENSE, tag: 'expenses', isCr: false}
});

export type CloseGet = {
  id: number;
  fnId: number;
  bal: number;
};

export type Core = {
  num: number;
  name: string;
  begAt: number;
  sumId?: string;
  catId?: number;
  isCr?: boolean;
};

export type Get = base.Get & Core & {
  oId: string;
  desc: desc.Get;
  clos: CloseGet[];
  actts: actt.Get[];
};

export type Post = Core & {
  oId?: string;
  desc?: desc.Post;
};