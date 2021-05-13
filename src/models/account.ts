import mongoose, {Schema} from 'mongoose';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';

export const ACCOUNT_NAME = 'Account';

const ObjectId = Schema.Types.ObjectId;

export type Category = {
  id: number,
  isCr: boolean
};

export const CatsByName: {[key: string]: Category} = Object.freeze({
  ASSET: {id: 1, name: 'asset', isCr: false},
  LIABILITY: {id: 2, name: 'liability', isCr: true},
  EQUITY: {id: 3, name: 'equity', isCr: true},
  INCOME: {id: 4, name: 'income', isCr: true},
  EXPENSE: {id: 5, name: 'expense', isCr: false}
});

export const findCatById = (id: number): Category | undefined => {
  for (const name in CatsByName) {
    const cat = CatsByName[name];
    if (cat.id === id) {
      return cat;
    }
  }
  return undefined;
}

export interface Account extends mongoose.Document {
  readonly oId: typeof ObjectId;
  readonly uId: typeof ObjectId;
  num: Number;
  name: String;
  begAt: Date;
  note?: String;
  paId?: typeof ObjectId;
  catId?: Number;
  isCr?: Boolean;
  closes: [{
    id: Number;
    fund: Number;
    bal: Number;
  }],
  suss: [{
    begAt: Date;
    bUId: typeof ObjectId;
    endAt?: Date;
    eUId?: typeof ObjectId;
    note?: String;
  }],
  readonly at: Date;
  readonly upAt: Date;
};

const schema = new Schema<Account, mongoose.Model<Account>>({
  oId: {type: ObjectId, ref: ORG_NAME, required: true}, // org
  uId: {type: ObjectId, ref: USER_NAME, required: true}, // create user
  num: {type: Number, required: true},
  name: {type: String, required: true,},
  begAt: Date,
  note: String,
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
    note: String
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, num: 1}, {unique: true})
  .index({oId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({oId: 1, catId: 1}, {sparse: true});

export const accountModel = mongoose.model(ACCOUNT_NAME, schema);
