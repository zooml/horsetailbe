import mongoose, {Schema} from 'mongoose';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';

export const SITE_ACCT_NAME = 'SiteAcct';

const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  oIds: [{type: ObjectId, ref: ORG_NAME}],
  name: String,
  note: String
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({uId: 1}, {unique: true});

export default mongoose.model(SITE_ACCT_NAME, schema);