import * as base from './base';
import * as desc from './desc';

type Core = {
  email: string;
  fName: string;
  lName?: string;
};

export type Get = base.Get & Core & {
  st: number;
  desc: desc.Get;
  opts: {[k: string]: any};
};

export type Creds = {
  email: string;
  pswd: string;
};

export type Post = Creds & Core & {
  desc: desc.Post;
};