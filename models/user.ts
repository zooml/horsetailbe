import mongoose, {Schema} from 'mongoose';

export const USER_NAME = 'User';

const schema = new Schema({
  email: {type: String, required: true},
  pswd: {type: String, required: true},
  salt: {type: Number, required: true},
  name: {type: String, required: true},
  isAct: {type: Boolean, required: true, default: true},
  opts: {},
  note: String
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

// TODO email validate: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export default mongoose.model(USER_NAME, schema);