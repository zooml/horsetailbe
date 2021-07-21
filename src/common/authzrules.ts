import { STD_ROLE_IDS } from "../api/orgs";

export const RSCS = Object.freeze({ // same as SEGMENTs
  USERS: 'users',
  ORGS: 'orgs',
  ACCOUNTS: 'accounts',
  TXNDOCS: 'txndocs'
});

export const METHS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE'
});

export const isReadMethod = (meth: string) => { // TODO needed?
  switch (meth) {
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
      return true;
  }
  return false;
};

type Role = {
  id: number;
};

export const isAllowed = (rsc: string, meth: string, roles: Role[]) => {
  // TODO SECURITY: only std roles currently
  if (roles.length !== 1) throw new Error('authzrules: unknown roles');
  // everyone can read
  return isReadMethod(meth) || roles[0].id === STD_ROLE_IDS.SUPER;
};