import mongoose, { Schema, ObjectId } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import { BaseDoc, Desc } from './basedoc';

export const NAME = 'Siteacct';

const SObjectId = Schema.Types.ObjectId;

export interface Doc extends mongoose.Document, BaseDoc {
  uId: ObjectId; // current owner
  name: string;
  desc: Desc;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  uId: {type: SObjectId, ref: USER_NAME, required: true},
  oIds: [{type: SObjectId, ref: ORG_NAME}],
  name: {type: String, required: true, trim: true},
  desc: { // must be Desc
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
}
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({uId: 1}, {unique: true});

export const Model = mongoose.model(NAME, schema);