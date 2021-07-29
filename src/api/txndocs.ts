import * as base from './base';
import * as desc from './desc';

export type AdjCore = {
  acId: string;
  amt: number;
};

export type AdjGet = AdjCore & {
  fnId: number;
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

export type AdjPost = AdjCore & {
  fnId?: number;
};

export type Post = Core & {
  adjs: AdjPost[],
  desc?: desc.Get;
};