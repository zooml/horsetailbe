import mongoose, { Schema } from 'mongoose';
import { trimOrUndef } from '../utils/util';
import * as doc from './doc';
import * as desc from './desc';
import bcrypt from 'bcrypt';
import { CredentialsError, UserNotActive } from '../controllers/errors';

export const NAME = 'User';

const SObjectId = Schema.Types.ObjectId;

export type UserState = {
  id: number,
  tag: string
};

export const USERSTATES_BY_TAG: {[k: string]: UserState} = Object.freeze({
  SIGNED_UP: {id: 1, tag: 'signedup'},
  WAIT_CONF: {id: 2, tag: 'waitconf'},
  ACTIVE: {id: 3, tag: 'active'},
  SUSPENDED: {id: 4, tag: 'suspended'},
  DELETED: {id: 5, tag: 'deleted'},
});

export interface Doc extends doc.Base {
  email: string;
  ePswd: string;
  fName: string;
  lName?: string;
  st: number;
  opts: {};
  desc: desc.Doc;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  email: {type: String, required: true, trim: true},
  ePswd: {type: String, required: true, trim: true},
  fName: {type: String, required: true, trim: true},
  lName: {type: String, trim: true},
  st: {type: Number, required: true},
  opts: {},
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: NAME, required: true},
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

export const Model = mongoose.model(NAME, schema);

const salts = 10;

export const encryptPswd = async (pswd: string) => {
  const s = trimOrUndef(pswd);
  return await bcrypt.hash(pswd, salts); // salt is in hash
}

const isMatchingPswd = async (pswd: string, ePswd: string) => await bcrypt.compare(pswd, ePswd);

export const authn = async (email: string, pswd: string): Promise<Doc> => {
  const user = await Model.findOne({email});
  if (!user || !await isMatchingPswd(pswd, user.ePswd)) throw new CredentialsError();
  if (user.st !== USERSTATES_BY_TAG.ACTIVE.id) throw new UserNotActive();
  return user;
};
