import mongoose, { Schema, Types } from 'mongoose';
import * as doc from './doc';
import * as acttgl from './acttgl';
import * as desc from './desc';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';

export const NAME = 'Account';

const SObjectId = Schema.Types.ObjectId;

export type Category = {
  id: number;
  tag: string;
  isCr: boolean;
};

export const CATEGORIES: {[k: string]: Category} = Object.freeze({
  ASSET: {id: 1, tag: 'asset', isCr: false},
  LIABILITY: {id: 2, tag: 'liability', isCr: true},
  EQUITY: {id: 3, tag: 'equity', isCr: true},
  INCOME: {id: 4, tag: 'income', isCr: true},
  EXPENSE: {id: 5, tag: 'expense', isCr: false}
});

export const findCatById = (id: number): Category | undefined => {
  for (const cat of Object.values(CATEGORIES)) {
    if (cat.id === id) return cat;
  }
  return undefined;
};

export interface Doc extends doc.Base {
  readonly oId: Types.ObjectId;
  num: number;
  name: string;
  begAt: Date;
  desc: desc.Doc;
  sumId?: Types.ObjectId;
  catId?: number;
  isCr?: boolean;
  clos: {
    id: number;
    fnId: number;
    bal: number;
  }[],
  actts: acttgl.Doc[]
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true}, // org
  num: {type: Number, required: true},
  name: {type: String, required: true, trim: true},
  begAt: Date,
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  sumId: {type: SObjectId, ref: NAME}, // summary/parent, required iif not top-level
  catId: Number, // category, required iif top-level
  isCr: Boolean, // required iif not default
  clos: [{
    id: {type: Number, required: true},
    fnId: {type: Number, required: true},
    bal: {type: Number, required: true}
  }],
  actts: [{ // acttgl.Doc schema
    at: {type: Date, required: true},
    isAct: {type: Boolean, required: true},
    desc: { // desc.Doc schema
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
