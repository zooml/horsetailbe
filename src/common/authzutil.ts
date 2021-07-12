export const RSCS = Object.freeze({
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
