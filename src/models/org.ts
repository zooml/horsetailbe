import mongoose, { Schema } from 'mongoose';
import { NAME as USER_NAME } from './user';
import * as doc from './doc';
import * as actt from './actt';
import * as desc from './desc';

const SObjectId = Schema.Types.ObjectId;

export const NAME = 'Org';

export const STATES = Object.freeze({
  ACTIVE: 1,
  DELETED: 2
});

export const STD_ROLE_IDS = Object.freeze({
  SUPER: 1, // all access
  AUDIT: 2 // readonly
});

export const GENERAL_FUND = Object.freeze({
  id: 1,
  tag: 'general'
});

export type RoleFlds = {
  readonly id: number;
  readonly uId: doc.ObjId;
  readonly at: Date;
};

export type UserFlds = {
  readonly id: doc.ObjId;
  readonly roles: RoleFlds[];
};

export type FundFields = {
  readonly id: number;
  tag: string;
  readonly begAt: Date;
  readonly at: Date;
  readonly desc: desc.Flds;
  readonly actts: actt.Flds[];
};

export type CloseFlds = {
  readonly id: number;
  readonly endAt: Date;
  readonly at: Date;
  readonly desc: desc.Flds;
};

export type CFlds = { // create fields
  readonly saId: doc.ObjId;
  name: string;
  st: number;
  readonly desc: desc.Flds;
  readonly users: UserFlds[];
  readonly funds: FundFields[];
  readonly clos: CloseFlds[];
};

export type Flds = doc.Flds & CFlds;

export type Doc = doc.Doc & Flds;

const schema = new Schema<Flds, mongoose.Model<Flds>>({
  saId: {type: SObjectId, ref: async ()=> (await import('./siteacct')).NAME, required: true},
  name: {type: String, required: true, trim: true},
  st: {type: Number, required: true},
  desc: { // desc.Flds schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  users: [{ // UserFlds schema
    id: {type: SObjectId, ref: USER_NAME, required: true},
    roles: [{ // RoleFlds schema
      id: {type: Number, required: true},
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      at: {type: Date, required: true}
    }]
  }],
  funds: [{ // FundFlds schema
    id: {type: Number, required: true},
    name: {type: String, required: true, trim: true},
    begAt: {type: Date, required: true},
    at: {type: Date, required: true},
    desc: { // desc.Flds schema
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    },
    actts: [{ // actt.Flds schema
      at: {type: Date, required: true},
      isAct: {type: Boolean, required: true},
      desc: { // desc.Flds schema
        uId: {type: SObjectId, ref: USER_NAME, required: true},
        note: {type: String, trim: true},
        id: {type: String, trim: true},
        url: {type: String, trim: true}
      },
    }]
  }],
  clos: [{
    id: {type: Number, required: true},
    endAt: {type: Date, required: true},
    at: {type: Date, required: true},
    desc: { // desc.Flds schema
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    },
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({saId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({'users.id': 1});

const model = mongoose.model<Flds>(NAME, schema);

export const create = async (f: CFlds): Promise<Doc> => doc.op(async () => model.create(f));

export const findById = async (id: doc.ObjId): Promise<Doc | undefined> => doc.op(async () =>
  model.findById(id));

export const findActiveByUser = async (uId: string): Promise<Doc[]> => doc.op(async () =>
  model.find({'users.id': uId, st: STATES.ACTIVE}, {id: 1, saId: 1, name: 1, 'users.$': 1}));

export const findActiveRolesForUser = async (oId: doc.ObjId, uId: doc.ObjId) => doc.op(async () => {
  const org = await model.findOne({_id: oId, 'users.id': uId, st: STATES.ACTIVE}, {'users.$': 1});
  return org?.users[0].roles.map(r => r.id) ?? [];
});

export const countActivePerSA = async (saId: doc.ObjId) => doc.op(async () =>
  // TODO returns only active, need to either garbage collect or count separate
  model.countDocuments({saId, st: STATES.ACTIVE}));