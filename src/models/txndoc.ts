import mongoose, { Schema, ObjectId } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import { NAME as ACCOUNT_NAME } from './account';
import { BaseDoc } from './basedoc';

export const NAME = 'TxnDoc';

const SObjectId = Schema.Types.ObjectId;

export interface Doc extends mongoose.Document, BaseDoc {
  oId: ObjectId;
  ts: string;
  uId: ObjectId;
  kind: string;
  entAt?: Date;
  amts: [{
    acId: ObjectId;
    fund: number;
    amt: number;
    note?: string;
  }],
  dueAt?: Date;
  refId?: string;
  note?: string;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true},
  ts: {type: String, required: true, trim: true}, // timestamp, e.g. 20210324231845012-s8v3x
  uId: {type: SObjectId, ref: USER_NAME, required: true},
  kind: {type: String, required: true, trim: true}, // TODO
  entAt: Date, // entry date (use at if undef)
  amts: [{
    acId: {type: SObjectId, ref: ACCOUNT_NAME, required: true},
    fund: {type: Number, required: true},
    amt: {type: Number, required: true},
    note: {type: String, trim: true}
  }],
  desc: { // must be Desc
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  }
  // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
  //   ct: String, // content type
  //   data: Buffer
  // }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, ts: 1}, {unique: true})
  .index({oId: 1, 'amts.acId': 1});

export const Model = mongoose.model(NAME, schema);