import mongoose, {Schema, ObjectId as TObjectId} from 'mongoose';
import { Basedoc } from './basedoc';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';

export const ACCOUNT_NAME = 'Account';

const ObjectId = Schema.Types.ObjectId;

export type Category = {
  id: number;
  tag: string;
  isCr: boolean;
};

export const catByTag: {[key: string]: Category} = Object.freeze({
  ASSET: {id: 1, tag: 'asset', isCr: false},
  LIABILITY: {id: 2, tag: 'liability', isCr: true},
  EQUITY: {id: 3, tag: 'equity', isCr: true},
  INCOME: {id: 4, tag: 'income', isCr: true},
  EXPENSE: {id: 5, tag: 'expense', isCr: false}
});

export const catById = (id: number): Category | undefined => {
  for (const name in catByTag) {
    const cat = catByTag[name];
    if (cat.id === id) {
      return cat;
    }
  }
  return undefined;
}

export interface Account extends mongoose.Document, Basedoc {
  readonly oId: TObjectId;
  readonly uId: TObjectId;
  num: Number;
  name: String;
  begAt: Date;
  note?: String;
  paId?: TObjectId;
  catId?: Number;
  isCr?: Boolean;
  closes: [{
    id: Number;
    fund: Number;
    bal: Number;
  }],
  suss: [{
    begAt: Date;
    bUId: TObjectId;
    endAt?: Date;
    eUId?: TObjectId;
    note?: String;
  }]
};

const schema = new Schema<Account, mongoose.Model<Account>>({
  oId: {type: ObjectId, ref: ORG_NAME, required: true}, // org
  uId: {type: ObjectId, ref: USER_NAME, required: true}, // create user
  num: {type: Number, required: true},
  name: {type: String, required: true, trim: true},
  begAt: Date,
  note: {type: String, trim: true},
  paId: {type: ObjectId, ref: ACCOUNT_NAME}, // parent, required iif not top-level
  catId: Number, // category, required iif top-level
  isCr: Boolean, // required iif not default
  closes: [{
    id: {type: Number, required: true},
    fund: {type: Number, required: true},
    bal: {type: Number, required: true}
  }],
  suss: [{
    begAt: {type: Date, required: true},
    bUId: {type: ObjectId, ref: USER_NAME, required: true},
    endAt: Date,
    eUId: {type: ObjectId, ref: USER_NAME},
    note: {type: String, trim: true}
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, num: 1}, {unique: true})
  .index({oId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({oId: 1, catId: 1}, {sparse: true});

export const accountModel = mongoose.model(ACCOUNT_NAME, schema);
