"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountName = exports.Categories = void 0;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
exports.Categories = Object.freeze({
    ASSET: { id: 1, credit: false },
    LIABILITY: { id: 2, credit: true },
    EQUITY: { id: 3, credit: true },
    INCOME: { id: 4, credit: true },
    EXPENSE: { id: 5, credit: false }
});
exports.AccountName = 'Account';
var AccountSchema = new Schema({
    oId: { type: String, required: true },
    uId: { type: String, required: true },
    name: { type: String, required: true, },
    num: { type: Number, required: true },
    note: String,
    parId: { type: Schema.Types.ObjectId, ref: exports.AccountName },
    catId: Number,
    isCr: Boolean,
    funds: [
        Number
    ],
    closes: [{
            id: { type: Number, required: true },
            fund: { type: Number, required: true },
            bal: { type: Number, required: true }
        }],
    suss: [{
            begAt: { type: Date, required: true },
            endAt: Date,
            note: String
        }]
}, { timestamps: { createdAt: 'at', updatedAt: 'upAt' } });
AccountSchema.index({ oId: 1, name: 1 }, { unique: true });
AccountSchema.index({ oId: 1, num: 1 }, { unique: true });
module.exports = mongoose.model(exports.AccountName, AccountSchema);
//# sourceMappingURL=account.js.map