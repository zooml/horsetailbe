import mongoose = require('mongoose');
const Schema = mongoose.Schema;

  export const Categories = Object.freeze({
    ASSET: {id: 1, credit: false},
    LIABILITY: {id: 2, credit: true},
    EQUITY: {id: 3, credit: true},
    INCOME: {id: 4, credit: true},
    EXPENSE: {id: 5, credit: false}
  });

const AccountSchema   = new Schema({
  userId: {type: String, required: true},
  name: {type: String, required: true, unique: true},
  num: {type: Number, required: true, unique: true},
  desc: String,
  parentId: String, // required iif not top-level
  categoryId: Number, // required iif top-level
  isCredit: Boolean, // required iif not default
  balance: {type: Number, default: 0.0}, // required iif leaf
  // funds: [{fund: String, balance: Number}]
},
{timestamps: true});

module.exports = mongoose.model('Account', AccountSchema);