import mongoose, {Schema, ObjectId } from 'mongoose';
import { ActTgl, BaseDoc, Desc } from './basedoc';
import { NAME as SITEACCT_NAME } from './siteacct';
import { NAME as USER_NAME } from './user';

const SObjectId = Schema.Types.ObjectId;

export const NAME = 'Org';
export const STD_ROLE_IDS = Object.freeze({
  SUPER: -1, // all access
  AUDIT: -2 // readonly
});

export interface Doc extends mongoose.Document, BaseDoc {
  saId: ObjectId;
  name: string;
  desc: Desc;
  users: {
    id: ObjectId;
    roles: {
      id: number;
      uId: ObjectId;
      at: Date;
    }[];
  }[];
  funds: {
    id: number;
    tag: string;
    begAt?: Date;
    at: Date;
    desc: Desc;
    actts: ActTgl[];
  }[];
  clos: {
    id: number;
    endAt: Date;
    at: Date;
    desc: Desc;
  }[];
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  saId: {type: Schema.Types.ObjectId, ref: SITEACCT_NAME, required: true},
  name: {type: String, required: true, trim: true},
  desc: { // must be Desc
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  users: [{
    id: {type: SObjectId, ref: USER_NAME, required: true},
    roles: [{
      id: {type: Number, required: true},
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      at: {type: Date, required: true}
    }]
  }],
  funds: [{
    id: {type: Number, required: true},
    name: {type: String, required: true, trim: true},
    begAt: {type: Date, required: true},
    at: {type: Date, required: true},
    desc: { // must be Desc
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    },
    actts: [{ // must be ActTgl
      at: {type: Date, required: true},
      isA: {type: Boolean, required: true},
      desc: { // must be Desc
        uId: {type: SObjectId, ref: USER_NAME, required: true},
        note: {type: String, trim: true},
        id: {type: String, trim: true},
        url: {type: String, trim: true}
      },
    }]
  }],
  closes: [{
    id: {type: Number, required: true},
    endAt: {type: Date, required: true},
    at: {type: Date, required: true},
    desc: { // must be Desc
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