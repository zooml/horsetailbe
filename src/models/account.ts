import mongoose, { Schema, ObjectId } from 'mongoose';
import { ActTgl, BaseDoc, Desc } from './basedoc';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';

export const NAME = 'Account';

const SObjectId = Schema.Types.ObjectId;

export type Category = {
  id: number;
  tag: string;
  isCr: boolean;
};

export const CAT_BY_TAG: {[key: string]: Category} = Object.freeze({
  ASSET: {id: 1, tag: 'asset', isCr: false},
  LIABILITY: {id: 2, tag: 'liability', isCr: true},
  EQUITY: {id: 3, tag: 'equity', isCr: true},
  INCOME: {id: 4, tag: 'income', isCr: true},
  EXPENSE: {id: 5, tag: 'expense', isCr: false}
});

export const catById = (id: number): Category | undefined => {
  for (const name in CAT_BY_TAG) {
    const cat = CAT_BY_TAG[name];
    if (cat.id === id) {
      return cat;
    }
  }
  return undefined;
}

export interface Doc extends mongoose.Document, BaseDoc {
  readonly oId: ObjectId;
  num: number;
  name: string;
  begAt: Date;
  desc: Desc;
  sumId?: ObjectId;
  catId?: number;
  isCr?: boolean;
  closes: [{
    id: number;
    fund: number;
    bal: number;
  }],
  actts: [ActTgl]
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true}, // org
  num: {type: Number, required: true},
  name: {type: String, required: true, trim: true},
  begAt: Date,
  desc: { // must be Desc
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  sumId: {type: SObjectId, ref: NAME}, // summary/parent, required iif not top-level
  catId: Number, // category, required iif top-level
  isCr: Boolean, // required iif not default
  closes: [{
    id: {type: Number, required: true},
    fund: {type: Number, required: true},
    bal: {type: Number, required: true}
  }],
  actts: [{ // must be ActTgl
    at: {type: Date, required: true},
    isA: {type: Boolean, required: true},
    desc: { // must be Desc
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    }
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, num: 1}, {unique: true})
  .index({oId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({oId: 1, catId: 1}, {sparse: true});

export const Model = mongoose.model(NAME, schema);
