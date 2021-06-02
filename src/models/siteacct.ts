import mongoose, { Schema, ObjectId } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import * as doc from './doc';
import * as desc from './desc';

export const NAME = 'Siteacct';

const SObjectId = Schema.Types.ObjectId;

export interface Doc extends doc.Base {
  uId: ObjectId; // current owner
  name: string;
  desc: desc.Doc;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  uId: {type: SObjectId, ref: USER_NAME, required: true},
  oIds: [{type: SObjectId, ref: ORG_NAME}],
  name: {type: String, required: true, trim: true},
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({uId: 1}, {unique: true});

export const Model = mongoose.model(NAME, schema);

export const create = async (uId: string) => await new Model({uId}).save();

export const findIdByUser = async (uId: string): Promise<ObjectId | undefined> => {
  const o = await Model.findOne({uId: doc.toObjId(uId)}, {_id: 1});
  return o?._id;
}
