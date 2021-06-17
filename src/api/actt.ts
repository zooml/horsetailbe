import * as desc from './desc';

export type Get = {
  at: number;
  isAct: boolean;
  desc: desc.Get;
};

export type Post = {
  desc: desc.Post
};