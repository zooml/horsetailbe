export type AcctCat = {
  readonly id: number;
  readonly tag: string;
  readonly isCr: boolean;
};

export const ACCTCATS: {[k: string]: AcctCat} = Object.freeze({
  ASSET: {id: 1, tag: 'asset', isCr: false},
  LIABILITY: {id: 2, tag: 'liability', isCr: true},
  EQUITY: {id: 3, tag: 'equity', isCr: true},
  INCOME: {id: 4, tag: 'income', isCr: true},
  EXPENSE: {id: 5, tag: 'expense', isCr: false}
});

export const findAcctCatById = (id: number): AcctCat | undefined => {
  for (const cat of Object.values(ACCTCATS)) {
    if (cat.id === id) return cat;
  }
  return undefined;
};
