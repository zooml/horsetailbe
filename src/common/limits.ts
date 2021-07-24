import { CATEGORIES } from "../api/accounts";
import { toCap } from "./validators";

export type LimitKind = 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'objectid' | 'object' | 'array' | 'choice';

export type Limit = {
  kind: LimitKind;
  name: string;
  hint?: string;
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
};

export type CurrencyLimit = Limit & {
  req: boolean;
};

export type ObjIdLimit = Limit & {
  req: boolean;
};

export type ObjLimit = Limit;

export type ArrLimit = LimitMinMax & {
  req: boolean;
};

export type Choices = {
  [k: number]: string; // values to labels
};

export type ChoiceLimit = Limit & {
  req: boolean;
  choices: Choices;
};

// allow sp, ', -
const NAME_REGEXP = /^[^!"#$%&()*+,./:;<=>?@[\\\]^_`{|}~]+$/;
const NAME_HINT = 'no special characters';

export const FIELDS = {
  tag: {kind: 'string', name: 'tag', min: 1, max: 16} as StrLimit,
  name: {kind: 'string', name: 'name', min: 1, max: 40} as StrLimit,
  note: {kind: 'string', name: 'note', min: 0, max: 800} as StrLimit,
  email: {kind: 'string', name: 'email', min: 1, max: 64,
    regex: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/
  } as StrLimit,
  pswd: {kind: 'string', name: 'pswd', min: 8, max: 30,
    regex: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/,
    hint: 'at least: 1 a-z, 1 A-Z, 1 digit, 1 special, 8 chars'
  } as StrLimit,
  signinPswd: {kind: 'string', name: 'pswd', min: 1, max: 30} as StrLimit,
  ePswd: {kind: 'string', name: 'ePswd', min: 8, max: 9999} as StrLimit,
  fName: {kind: 'string', name: 'fName', min: 1, max: 20, regex: NAME_REGEXP,
    hint: NAME_HINT} as StrLimit,
  lName: {kind: 'string', name: 'lName', min: 0, max: 40, regex: NAME_REGEXP,
    hint: NAME_HINT} as StrLimit,
  id: {kind: 'string', name: 'id', min: 0, max: 100} as StrLimit, // external id, note id numberic fields too
  url: {kind: 'string', name: 'url', min: 0, max: 400,
    regex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
  } as StrLimit,

  num: {kind: 'number', name: 'num', min: 100, max: 999999, req: true} as NumLimit,
  st: {kind: 'number', name: 'st', min: 1, max: 99999, req: true} as NumLimit,
  fnId: {kind: 'number', name: 'fnId', min: 1, max: 99999, req: true} as NumLimit,
  tdTId: {kind: 'number', name: 'tdTId', min: 1, max: 99999, req: true} as NumLimit,

  isCr: {kind: 'boolean', name: 'isCr', req: false} as BoolLimit,

  begAt: {kind: 'date', name: 'begAt', dayBeg: true} as DateLimit,
  dueAt: {kind: 'date', name: 'dueAt', dayBeg: true, req: false} as DateLimit,

  amt: {kind: 'currency', name: 'amt', req: true} as CurrencyLimit,

  uId: {kind: 'objectid', name: 'uId', req: false} as ObjIdLimit,
  saId: {kind: 'objectid', name: 'saId', req: true} as ObjIdLimit,
  oId: {kind: 'objectid', name: 'oId', req: true} as ObjIdLimit,
  sumId: {kind: 'objectid', name: 'sumId', req: false} as ObjIdLimit,
  acId: {kind: 'objectid', name: 'acId', req: true} as ObjIdLimit,

  desc: {kind: 'object', name: 'desc'} as ObjLimit,
  opts: {kind: 'object', name: 'opts'} as ObjLimit,

  actts: {kind: 'array', name: 'actts', min: 0, max: 5, req: true} as ArrLimit, // number of activation toggles
  clos: {kind: 'array', name: 'clos', min: 0, max: 240, req: true} as ArrLimit, // number of closing entries
  users: {kind: 'array', name: 'users', min: 1, max: 3, req: true} as ArrLimit, // users/org
  funds: {kind: 'array', name: 'funds', min: 1, max: 100, req: true} as ArrLimit, // defined funds (act & sus)/org
  adjs: {kind: 'array', name: 'adjs', min: 2, max: 20, req: true} as ArrLimit, // txndoc

  catId: {kind: 'choice', name: 'catId', req: false, choices: Object.values(CATEGORIES)
    .reduce((p, c) => {p[c.id] = toCap(c.tag); return p;}, {} as Choices),
    hint: 'General summary accounts are classified.'} as ChoiceLimit,
};

export const RESOURCES = {
  accounts: {perOrg: {max: 400}},
  txndocs: {perOrg: {max: 20000}},
  orgs: {perSA: {max: 3}, perUser: {max: 10}}, // maxPerUser is max number user can join
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