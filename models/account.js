"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categories = void 0;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
exports.Categories = Object.freeze({
    ASSET: { id: 1, credit: false },
    LIABILITY: { id: 2, credit: true },
    EQUITY: { id: 3, credit: true },
    INCOME: { id: 4, credit: true },
    EXPENSE: { id: 5, credit: false }
});
var AccountSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    num: { type: Number, required: true, unique: true },
    desc: String,
    parentId: String,
    categoryId: Number,
    isCredit: Boolean,
    balance: { type: Number, default: 0.0 }, // required iif leaf
    // funds: [{fund: String, balance: Number}]
}, { timestamps: true });
module.exports = mongoose.model('Account', AccountSchema);
//# sourceMappingURL=account.js.map