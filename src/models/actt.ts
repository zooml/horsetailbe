import * as desc from './desc';

export type Flds = {
  at: Date;
  isAct: boolean; // is activation, else suspension, must toggle back and forth
  desc: desc.Flds;
};
