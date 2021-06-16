import * as base from './base';
import * as desc from './desc';

export type Get = base.Get & {
  uId: string;
  name: string;
  desc: desc.Get;
};
