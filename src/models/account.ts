import mongoose, { Schema } from 'mongoose';
import * as doc from './doc';
import * as actt from './actt';
import * as desc from './desc';
import { NAME as ORG_NAME } from './org';
import { NAME as USER_NAME } from './user';

export const NAME = 'Account';

const SObjectId = Schema.Types.ObjectId;

export type CloseFlds = {
  readonly id: number;
  readonly fnId: number;
  readonly bal: number;
}

export type CFlds = { // create fields
  readonly oId: doc.ObjId;
  num: number;
  name: string;
  begAt: Date;
  readonly desc: desc.Flds;
  sumId?: doc.ObjId;
  catId?: number;
  isCr?: boolean;
  readonly clos: CloseFlds[];
  readonly actts: actt.Flds[];
};

export type FFlds = { // filter fields
  oId?: doc.ObjId;
  catId?: number;
};

export type Flds = doc.Flds & CFlds;

export type Doc = doc.Doc & Flds;

const schema = new Schema<Flds, mongoose.Model<Flds>>({
  oId: {type: SObjectId, ref: ORG_NAME, required: true}, // org
  num: {type: Number, required: true},
  name: {type: String, required: true, trim: true},
  begAt: Date,
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: USER_NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  },
  sumId: {type: SObjectId, ref: NAME}, // summary/parent, required iif not top-level
  catId: Number, // category, required iif top-level
  isCr: Boolean, // required iif not default
  clos: [{
    id: {type: Number, required: true},
    fnId: {type: Number, required: true},
    bal: {type: Number, required: true}
  }],
  actts: [{ // actt.Doc schema
    at: {type: Date, required: true},
    isAct: {type: Boolean, required: true},
    desc: { // desc.Doc schema
      uId: {type: SObjectId, ref: USER_NAME, required: true},
      note: {type: String, trim: true},
      id: {type: String, trim: true},
      url: {type: String, trim: true}
    }
  }]
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema
  .index({oId: 1, num: 1}, {unique: true})
  .index({oId: 1, name: 1}, {unique: true, collation: {locale: 'en', strength: 1}})
  .index({oId: 1, catId: 1}, {sparse: true});

const model = mongoose.model<Flds>(NAME, schema);

export const create = async (f: CFlds): Promise<Doc> => doc.op(async () => model.create(f));

export const findById = async (id: doc.ObjId, p?: {[k: string]: number}): Promise<Doc | undefined> => doc.op(async () =>
  model.findById(id, p));

export const findByOrg = async (oId: doc.ObjId): Promise<Doc[]> => doc.op(async () =>
  model.find({oId}).sort({num: 1}));

export const exists = async (f: FFlds): Promise<boolean> => doc.op(async () =>
  model.exists(f));

export const findOneGANum = async (oId: doc.ObjId): Promise<number | undefined> => doc.op(async () => {
  const d = await model.findOne({oId}, 'num').sort({catId: 1});
  return d?.num;
});

export const countPerOrg = async (oId: doc.ObjId): Promise<number> => doc.op(async () =>
  model.countDocuments({oId}));