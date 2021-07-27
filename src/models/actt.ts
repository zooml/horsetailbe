import * as desc from './desc';

export type Flds = {
  at: Date;
  isAct: boolean; // is activation, else suspension, must toggle back and forth
  desc: desc.Flds;
};

export const isActiveAt = (fs: Flds[], at: Date) => {
  // note must check enclosing doc's begAt date first
  let isAct = true;
  for (const f of fs) {
    if (at < f.at) return isAct;
    isAct = !isAct;
  }
  return isAct;
}
