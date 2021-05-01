import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema   = new Schema({
  userId: {type: String, required: true},
  name: {type: String, required: true, unique: true},
  number: {type: String, required: true, unique: true},
  desc: String,
  credit: Boolean, // required if top-level
  parentId: String, // required if not top-level
  amount: {type: Number, default: 0.0}, // required if leaf
  // funds: [{fund: String, amount: Number}]
},
{timestamps: true});

module.exports = mongoose.model('Account', AccountSchema);