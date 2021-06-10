import mongoose, { Schema } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import * as doc from './doc';
import * as desc from './desc';

export const NAME = 'Siteacct';

const SObjectId = Schema.Types.ObjectId;

export type CFlds = {
  uId: doc.ObjId; // current owner
  name: string;
  desc: desc.Flds;
};

export type Flds = doc.Flds & CFlds;

export type Doc = doc.Doc & Flds;

const schema = new Schema<Flds, mongoose.Model<Flds>>({
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

const model = mongoose.model<Flds>(NAME, schema);

export const create = async (f: CFlds) => doc.op(async () => model.create(f));

export const findIdByUser = async (uId: doc.ObjId): Promise<doc.ObjId | undefined> => doc.op(async () => {
  const d = await model.findOne({uId}, {_id: 1});
  return d?._id;
});
