import mongoose, {Schema} from 'mongoose';
import {ORG_NAME} from './org';
import {USER_NAME} from './user';
import {ACCOUNT_NAME} from './account';

export const TXNDOC_NAME = 'TxnDoc';

const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  oId: {type: ObjectId, ref: ORG_NAME, required: true},
  tsId: {type: String, required: true}, // timestamp id, e.g. 20210324231845012-s8v3xf
  uId: {type: ObjectId, ref: USER_NAME, required: true},
  kind: {type: String, required: true}, // TODO
  entAt: {type: Date, required: true}, // entry date
  amts: [{
    acId: {type: ObjectId, ref: ACCOUNT_NAME, required: true}, 
    fund: {type: Number, required: true},
    amt: {type: Number, required: true}, 
    note: String
  }],
  extRef: String,
  extUrl: String,
  note: String,
  // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
  //   ct: String, // content type
  //   data: Buffer
  // }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, tsId: 1}, {unique: true})
  .index({oId: 1, 'amts.acId': 1});

export const txndocModel = mongoose.model(TXNDOC_NAME, schema);