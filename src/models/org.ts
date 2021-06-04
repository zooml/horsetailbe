import mongoose, {Schema, ObjectId } from 'mongoose';
import { NAME as SITEACCT_NAME } from './siteacct';
import { NAME as USER_NAME } from './user';
import * as doc from './doc';
import * as acttgl from './acttgl';
import * as desc from './desc';

const SObjectId = Schema.Types.ObjectId;

export const NAME = 'Org';

export const STD_ROLE_IDS = Object.freeze({
  SUPER: 1, // all access
  AUDIT: 2 // readonly
});

export const GENERAL_FUND = {
  id: 1,
  tag: 'general'
};

export type RoleDoc = {
  id: number;
  uId: ObjectId;
  at: Date;
};

export type UserDoc = {
  id: ObjectId;
  roles: RoleDoc[];
};

export type FundDoc = {
  id: number;
  tag: string;
  begAt?: Date;
  at: Date;
  desc: desc.Doc;
  actts: acttgl.Doc[];
};

export type CloseDoc = {
  id: number;
  endAt: Date;
  at: Date;
  desc: desc.Doc;
};

export interface Doc extends doc.Base {
  saId: ObjectId;
  name: string;
  desc: desc.Doc;
  users: UserDoc[];
  funds: FundDoc[];
  clos: CloseDoc[];
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  saId: {type: SObjectId, ref: async ()=> (await import('./siteacct')).NAME, required: true},
  name: {type: String, required: true, trim: true},
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  users: [{ // UserDoc schema
    id: {type: SObjectId, ref: USER_NAME, required: true},
    roles: [{ // RoleDoc schema
      id: {type: Number, required: true},
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      at: {type: Date, required: true}
    }]
  }],
  funds: [{ // FundDoc schema
    id: {type: Number, required: true},
    name: {type: String, required: true, trim: true},
    begAt: {type: Date, required: true},
    at: {type: Date, required: true},
    desc: { // desc.Doc schema
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    },
    actts: [{ // acttgl.Doc schema
      at: {type: Date, required: true},
      isAct: {type: Boolean, required: true},
      desc: { // desc.Doc schema
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
    desc: { // desc.Doc schema
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

export const Model = mongoose.model(NAME, schema);

export const findRolesForUser = async (oId: string, uId: string): Promise<number[]> => {
  const org = await Model.findOne(
    {_id: oId, 'users.id': uId},
    {'users.$': 1});
  return org?.users[0].roles.map(r => r.id) ?? [];
};

export const countOrgsPerSA = async (saId: ObjectId): Promise<number> => await Model.countDocuments({saId});