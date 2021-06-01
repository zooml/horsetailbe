import * as desc from './desc';

export interface Doc {
  at: Date;
  isA: boolean; // is activation, else suspension
  desc: desc.Doc;
};
