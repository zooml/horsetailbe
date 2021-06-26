import * as base from './base';
import * as desc from './desc';

export type Core = {
  email: string;
  fName: string;
  lName?: string;
};

export type Base = Core & { // no conversion needed for fields so these can be used in model
  st: number;
  desc: desc.Get;
  opts: {[k: string]: any};
};

export type Get = base.Get & Base;

export type Post = Core & {
  pswd: string;
  desc?: desc.Post;
};