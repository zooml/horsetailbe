import mongoose, { Schema, ObjectId } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import { NAME as ACCOUNT_NAME } from './account';
import { BaseDoc, Desc } from './basedoc';

export const NAME = 'TxnDoc';

const SObjectId = Schema.Types.ObjectId;

export interface Doc extends mongoose.Document, BaseDoc {
  oId: ObjectId;
  ts: string;
  kind: string;
  desc: Desc;
  begAt?: Date;
  amts: {
    acId: ObjectId;
    fund: number;
    amt: number;
  }[],
  dueAt?: Date;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true},
  ts: {type: String, required: true, trim: true}, // timestamp, e.g. 20210324231845012-s8v3x
  kind: {type: String, required: true, trim: true}, // TODO
  desc: { // must be Desc
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  begAt: Date, // entry date (use at if undef)
  amts: [{
    acId: {type: SObjectId, ref: ACCOUNT_NAME, required: true},
    fund: {type: Number, required: true},
    amt: {type: Number, required: true}
  }],
  // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
  //   ct: String, // content type
  //   data: Buffer
  // }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, ts: 1}, {unique: true})
  .index({oId: 1, 'amts.acId': 1});

export const Model = mongoose.model(NAME, schema);