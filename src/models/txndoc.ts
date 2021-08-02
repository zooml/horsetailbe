import mongoose, { Schema } from 'mongoose';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';
import { NAME as ACCOUNT_NAME } from './account';
import * as doc from './doc';
import * as desc from './desc';

export const NAME = 'Txndoc';

const SObjectId = Schema.Types.ObjectId;

export type AdjCFlds = {
  acId: doc.ObjId;
  fnId: number;
  amt: number;
};

export type CFlds = {
  oId: doc.ObjId;
  begAt: Date;
  tdTId: number;
  desc: desc.Flds;
  adjs: AdjCFlds[],
  dueAt?: Date;
};

export type AdjFlds = AdjCFlds;

export type Flds = doc.Flds & CFlds;

export type Doc = doc.Doc & Flds;

const schema = new Schema<Flds, mongoose.Model<Flds>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true},
  begAt: {type: Date, required: true},
  tdTId: {type: Number, required: true},
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  adjs: [{
    acId: {type: SObjectId, ref: ACCOUNT_NAME, required: true},
    fnId: {type: Number, required: true},
    amt: {type: Number, required: true}
  }],
  dueAt: Date
  // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
  //   ct: String, // content type
  //   data: Buffer
  // }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, begAt: 1, at: 1}, {unique: true})
  .index({oId: 1, 'adjs.acId': 1, begAt: 1});

const model = mongoose.model(NAME, schema);

export const create = async (f: CFlds): Promise<Doc> => doc.op(async () =>
  model.create(f));

export const findByOrg = async (oId: doc.ObjId, flt?: {[k: string]: any}, lim?: number): Promise<Doc[]> => doc.op(async () => {
  const f = flt ? {oId, ...flt} : {oId};
  let res = model.find(f).sort({begAt: -1, at: -1});
  if (lim) res = res.limit(lim);
  return res;
});

export const countForOrg = async (oId: doc.ObjId): Promise<number> => doc.op(async () =>
  model.countDocuments({oId}));
