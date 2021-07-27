import * as base from './base';
import * as desc from './desc';

export type AdjGet = {
  acId: string;
  fnId: number;
  amt: number;
};

export type Core = {
  begAt: number;
  tdTId: number;
  dueAt?: number;
};

export type Get = base.Get & Core & {
  oId: string;
  adjs: AdjGet[],
  desc: desc.Get;
};

export type AdjPost = AdjGet;

export type Post = Core & {
  adjs: AdjPost[],
  desc?: desc.Get;
};