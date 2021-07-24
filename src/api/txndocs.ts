import * as base from './base';
import * as desc from './desc';

export type AdjGet = {
  acId: string;
  fnId: number;
  amt: number;
};

export type Core = {
  oId: string;
  begAt: number;
  tdTId: number;
  desc: desc.Get;
  adjs: AdjGet[],
  dueAt?: number;
};

export type Get = base.Get & Core;

export type AdjPost = AdjGet;

export type Post = Core;