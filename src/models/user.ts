import mongoose, { Schema } from 'mongoose';
import { BaseDoc } from './basedoc';

export const NAME = 'User';

export type UserState = {
  id: number,
  tag: string
};

export const USERSTATES_BY_TAG: {[key: string]: UserState} = Object.freeze({
  SIGNED_UP: {id: 1, tag: 'signedup'},
  WAIT_CONF: {id: 2, tag: 'waitconf'},
  ACTIVE: {id: 3, tag: 'active'},
  SUSPENDED: {id: 4, tag: 'suspended'},
  DELETED: {id: 5, tag: 'deleted'},
});

export interface Doc extends mongoose.Document, BaseDoc {
  email: string;
  ePswd: string;
  fName: string;
  lName?: string;
  st: number;
  opts: {};
  note?: string;
};

const schema = new Schema<Doc, mongoose.Model<Doc>>({
  email: {type: String, required: true, trim: true},
  ePswd: {type: String, required: true, trim: true},
  fName: {type: String, required: true, trim: true},
  lName: {type: String, trim: true},
  st: {type: Number, required: true},
  opts: {},
  desc: { // must be Desc
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

export const Model = mongoose.model(NAME, schema);