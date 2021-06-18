import * as base from './base';
import * as desc from './desc';

type Core = {
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

export type Creds = {
  email: string;
  pswd: string;
};

export type Post = Creds & Core & {
  desc: desc.Post;
};