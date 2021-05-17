import mongoose, {Schema, ObjectId as TObjectId} from 'mongoose';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';

export const SITEACCT_NAME = 'Siteacct';

const ObjectId = Schema.Types.ObjectId;

export interface Siteacct extends mongoose.Document {
  uId: TObjectId;
  oIds: [TObjectId];
  name?: String;
  note?: String;
  readonly at: Date;
  readonly upAt: Date;
};

const schema = new Schema<Siteacct, mongoose.Model<Siteacct>>({
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  oIds: [{type: ObjectId, ref: ORG_NAME}],
  name: {type: String, trim: true},
  note: {type: String, trim: true}
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({uId: 1}, {unique: true});

export const siteacctModel = mongoose.model(SITEACCT_NAME, schema);