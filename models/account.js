const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema   = new Schema({
  userId: {type: String, required: true},
  name: {type: String, required: true, unique: true},
  number: {type: String, required: true, unique: true},
  credit: {type: Boolean, required: true},
  desc: String,
  parentId: String, // undef if top level
  amount: {type: Number, default: 0.0}, // undef if not leaf
  // funds: [{fund: String, amount: Double}]
},
{timestamps: true});

module.exports = mongoose.model('Account', AccountSchema);