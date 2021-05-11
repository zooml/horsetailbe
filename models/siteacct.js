"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var SiteAcctSchema = new Schema({
    oIds: [String],
    note: String
}, { timestamps: { createdAt: 'at', updatedAt: 'upAt' } });
module.exports = mongoose.model('SiteAcct', SiteAcctSchema);
//# sourceMappingURL=siteacct.js.map