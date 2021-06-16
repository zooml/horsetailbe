import * as base from './base';
import * as desc from './desc';

type GetEx = {
  email: string;
  fName: string;
  lName?: string;
  st: number;
  opts: {[k: string]: any};
  desc: desc.Get;
};

export type Get = base.Get & GetEx;

export type Creds = {
  email: string;
  pswd: string;
};

export type Post = Creds & GetEx;