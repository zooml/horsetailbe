import mongoose, {Schema} from 'mongoose';
import {SITE_ACCT_NAME} from './siteacct';
import {USER_NAME} from './user';

export const ORG_NAME = 'Org';

const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  saId: {type: ObjectId, ref: SITE_ACCT_NAME, required: true},
  name: {type: String, required: true},
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  note: String,
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
    name: {type: String, required: true},
    begAt: {type: Date, required: true},
    uId: {type: ObjectId, ref: USER_NAME, required: true},
    at: {type: Date, required: true},
    note: String,
    suss: [{
      begAt: {type: Date, required: true},
      bUId: {type: ObjectId, ref: USER_NAME, required: true},
      endAt: Date,
      eUId: {type: ObjectId, ref: USER_NAME},
      note: String
    }]
  }],
  closes: [{
    id: {type: Number, required: true},
    endAt: {type: Date, required: true},
    uId: {type: ObjectId, ref: USER_NAME, required: true},
    at: {type: Date, required: true},
    note: String
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({saId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({'users.id': 1});

export default mongoose.model(ORG_NAME, schema);