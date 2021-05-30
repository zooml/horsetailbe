const limits: {[key: string]: any} = {
  fields: {
    tag: {max: 12},
    name: {max: 60},
    note: {max: 800},
    email: {max: 64},
    fName: {max: 20},
    lName: {max: 40},
    id: {max: 100}, // external id, note id numberic fields too
    url: {max: 400}
  },
  fldarrs: {
    actts: {max: 5}, // number of activation toggles
    clos: {max: 120}, // number of closing entries
    users: {max: 3}, // users/org
    funds: {max: 10}, // defined funds/org
    amts: {max: 20}, // amounts/txndoc
  },
  resources: {
    accounts: {perOrg: {max: 400}},
    txndocs: {perOrg: {max: 20000}},
    orgs: {perSA: {max: 5}, perUser: {max: 10}}, // maxPerUser is max number user can join
  },
  session: {
    maxAge: 2 * 24 * 60 * 60
  },
  digest: {
    keys: ['4Mo69bQG&#5^']
  }
};

export default limits;