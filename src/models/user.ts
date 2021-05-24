import mongoose, { Schema } from 'mongoose';
import { Basedoc } from './basedoc';

export const USER_NAME = 'User';

export type UserState = {
  id: number,
  tag: string
};

export const userStates: {[key: string]: UserState} = Object.freeze({
  SIGNED_UP: {id: 1, tag: 'signedup'},
  WAIT_CONF: {id: 2, tag: 'waitconf'},
  ACTIVE: {id: 3, tag: 'active'},
  SUSPENDED: {id: 4, tag: 'suspended'},
  DELETED: {id: 5, tag: 'deleted'},
});

export interface User extends mongoose.Document, Basedoc {
  email: String;
  ePswd: String;
  fName: String;
  lName?: String;
  st: Number;
  opts: {};
  note?: String;
};

const schema = new Schema<User, mongoose.Model<User>>({
  email: {type: String, required: true, trim: true},
  ePswd: {type: String, required: true, trim: true},
  fName: {type: String, required: true, trim: true},
  lName: {type: String, trim: true},
  st: {type: Number, required: true},
  opts: {},
  note: {type: String, trim: true}
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

export const userModel = mongoose.model(USER_NAME, schema);