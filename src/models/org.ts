import mongoose, {Schema, ObjectId as TObjectId} from 'mongoose';
import {SITEACCT_NAME} from './siteacct';
import {USER_NAME} from './user';

export const ORG_NAME = 'Org';

const ObjectId = Schema.Types.ObjectId;

export const orgRoles = Object.freeze({
  ADMIN: 1
});

export interface Org extends mongoose.Document {
  saId: TObjectId;
  name: String;
  uId: TObjectId;
  note?: String;
  users: [{
    id: TObjectId;
    roles: [{
      id: Number;
      uId: TObjectId;
      at: Date;
    }];
  }];
  funds: [{
    id: Number;
    name: String;
    begAt?: Date;
    uId: TObjectId;
    at: Date;
    note?: String;
    suss: [{
      begAt: Date;
      bUId: TObjectId;
      endAt?: Date;
      eUId?: TObjectId;
      note?: String;
    }];
  }];
  closes: [{
    id: Number;
    endAt: Date;
    uId: TObjectId;
    at: Date;
    note?: String;
  }];
  readonly at: Date;
  readonly upAt: Date;
};

const schema = new Schema<Org, mongoose.Model<Org>>({
  saId: {type: ObjectId, ref: SITEACCT_NAME, required: true},
  name: {type: String, required: true, trim: true},
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  note: {type: String, trim: true},
  users: [{
    id: {type: ObjectId, ref: USER_NAME, required: true},
    roles: [{
      id: {type: Number, required: true},
      uId: {type: ObjectId, ref: USER_NAME, required: true},
      at: {type: Date, required: true}
    }]
  }],
  funds: [{
    id: {type: Number, required: true},
    name: {type: String, required: true, trim: true},
    begAt: {type: Date, required: true},
    uId: {type: ObjectId, ref: USER_NAME, required: true},
    at: {type: Date, required: true},
    note: {type: String, trim: true},
    suss: [{
      begAt: {type: Date, required: true},
      bUId: {type: ObjectId, ref: USER_NAME, required: true},
      endAt: Date,
      eUId: {type: ObjectId, ref: USER_NAME},
      note: {type: String, trim: true}
    }]
  }],
  closes: [{
    id: {type: Number, required: true},
    endAt: {type: Date, required: true},
    uId: {type: ObjectId, ref: USER_NAME, required: true},
    at: {type: Date, required: true},
    note: {type: String, trim: true}
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({saId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({'users.id': 1});

export const orgModel = mongoose.model(ORG_NAME, schema);