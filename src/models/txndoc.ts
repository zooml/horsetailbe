import mongoose, {Schema, ObjectId as TObjectId} from 'mongoose';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';
import {ACCOUNT_NAME} from './account';

export const TXNDOC_NAME = 'TxnDoc';

const ObjectId = Schema.Types.ObjectId;

export interface Txndoc extends mongoose.Document {
  oId: TObjectId;
  ts: String;
  uId: TObjectId;
  kind: String;
  entAt?: Date;
  amts: [{
    acId: TObjectId;
    fund: Number;
    amt: Number;
    note?: String;
  }],
  refId?: String;
  note?: String;
  readonly at: Date;
  readonly upAt: Date;
};

const schema = new Schema<Txndoc, mongoose.Model<Txndoc>>({
  oId: {type: ObjectId, ref: ORG_NAME, required: true},
  ts: {type: String, required: true, trim: true}, // timestamp, e.g. 20210324231845012-s8v3x
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  kind: {type: String, required: true, trim: true}, // TODO
  entAt: Date, // entry date (use at if undef)
  amts: [{
    acId: {type: ObjectId, ref: ACCOUNT_NAME, required: true},
    fund: {type: Number, required: true},
    amt: {type: Number, required: true},
    note: {type: String, trim: true}
  }],
  refId: {type: String, trim: true},
  note: {type: String, trim: true},
  // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
  //   ct: String, // content type
  //   data: Buffer
  // }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, ts: 1}, {unique: true})
  .index({oId: 1, 'amts.acId': 1});

export const txndocModel = mongoose.model(TXNDOC_NAME, schema);