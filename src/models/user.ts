import mongoose, {Schema} from 'mongoose';

export const USER_NAME = 'User';

export interface User extends mongoose.Document {
  email: String,
  ePswd: String,
  fName: String,
  lName?: String,
  isAct: Boolean,
  opts: {[key: string]: any},
  note?: String,
  readonly at: Date,
  readonly upAt: Date
};

const schema = new Schema<User, mongoose.Model<User>>({
  email: {type: String, required: true, trim: true},
  ePswd: {type: String, required: true, trim: true},
  fName: {type: String, required: true, trim: true},
  lName: {type: String, trim: true},
  isAct: {type: Boolean, required: true},
  opts: {},
  note: {type: String, trim: true}
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

export const userModel = mongoose.model(USER_NAME, schema);