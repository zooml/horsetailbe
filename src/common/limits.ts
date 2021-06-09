import { ACCTCATS } from "./acctcat";

export type LimitKind = 'string' | 'number' | 'boolean' | 'date' | 'objectid' | 'object' | 'array';

export type Limit = {
  kind: LimitKind;
  name: string;
};

export type LimitMinMax = Limit & {
  max: number;
  min: number;
};

export type StrLimit = LimitMinMax & { // set min to 0 for 'not required'
  regex?: RegExp;
};

export type NumLimit = LimitMinMax & {
  req: boolean;
};

export type BoolLimit = Limit & {
  req: boolean;
};

export type DateLimit = Limit & {
  req: boolean;
  dayBeg?: boolean;
  minToday?: boolean;
};

export type ObjIdLimit = Limit & {
  req: boolean;
};

export type ObjLimit = Limit;

export type ArrLimit = LimitMinMax & {
  req: boolean;
};

export const NAME_REGEXP = /^[0-9A-Za-z]+$/;

export const FIELDS = {
  tag: {kind: 'string', name: 'tag', min: 1, max: 12} as StrLimit,
  name: {kind: 'string', name: 'name', min: 1, max: 60} as StrLimit,
  note: {kind: 'string', name: 'note', min: 0, max: 800} as StrLimit,
  email: {kind: 'string', name: 'email', min: 1, max: 64,
    regex: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
  } as StrLimit,
  pswd: {kind: 'string', name: 'pswd', min: 8, max: 30,
    regex: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/
  } as StrLimit,
  ePswd: {kind: 'string', name: 'ePswd', min: 8, max: 9999} as StrLimit,
  fName: {kind: 'string', name: 'fName', min: 1, max: 20, regex: NAME_REGEXP} as StrLimit,
  lName: {kind: 'string', name: 'lName', min: 0, max: 40, regex: NAME_REGEXP} as StrLimit,
  id: {kind: 'string', name: 'id', min: 0, max: 100} as StrLimit, // external id, note id numberic fields too
  url: {kind: 'string', name: 'url', min: 0, max: 400,
    regex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
  } as StrLimit,

  num: {kind: 'number', name: 'num', min: 100, max: 999999, req: true} as NumLimit,
  catId: {kind: 'number', name: 'catId', min: 1, max: Object.keys(ACCTCATS).length, req: false} as NumLimit,
  st: {kind: 'number', name: 'st', min: 1, max: 99999, req: true} as NumLimit,

  isCr: {kind: 'boolean', name: 'isCr', req: false} as BoolLimit,

  begAt: {kind: 'date', name: 'begAt', dayBeg: true, minToday: true} as DateLimit,

  uId: {kind: 'objectid', name: 'uId', req: false} as ObjIdLimit,
  saId: {kind: 'objectid', name: 'saId', req: true} as ObjIdLimit,
  oId: {kind: 'objectid', name: 'oId', req: true} as ObjIdLimit,
  sumId: {kind: 'objectid', name: 'sumId', req: false} as ObjIdLimit,

  desc: {kind: 'object', name: 'desc'} as ObjLimit,
  opts: {kind: 'object', name: 'opts'} as ObjLimit,

  actts: {kind: 'array', name: 'actts', min: 0, max: 5, req: true} as ArrLimit, // number of activation toggles
  clos: {kind: 'array', name: 'clos', min: 0, max: 240, req: true} as ArrLimit, // number of closing entries
  users: {kind: 'array', name: 'users', min: 1, max: 3, req: true} as ArrLimit, // users/org
  funds: {kind: 'array', name: 'funds', min: 1, max: 100, req: true} as ArrLimit, // defined funds (act & sus)/org
  amts: {kind: 'array', name: 'amts', min: 2, max: 20, req: true} as ArrLimit, // amounts/txndoc
};

export const RESOURCES = {
  accounts: {perOrg: {max: 400}},
  txndocs: {perOrg: {max: 20000}},
  orgs: {perSA: {max: 5}, perUser: {max: 10}}, // maxPerUser is max number user can join
};

const LIMITS = {
  session: {
    maxAge: 2 * 24 * 60 * 60
  },
  digest: {
    keys: ['4Mo69bQG&#5^']
  }
};

export default LIMITS;