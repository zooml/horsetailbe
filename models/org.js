"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORG_NAME = void 0;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var user_1 = require("user");
var ObjectId = Schema.Types.ObjectId;
exports.ORG_NAME = 'org';
var OrgSchema = new Schema({
    saId: { type: ObjectId, ref: user_1.USER_NAME, required: true },
    name: { type: String, required: true },
    note: String,
    users: [{
            id: { type: ObjectId, ref: user_1.USER_NAME, required: true },
            perms: [{
                    action: { type: String, required: true },
                    grantorId: { type: Number, required: true },
                    at: { type: Date, required: true }
                }]
        }],
    funds: [{
            id: { type: Number, required: true },
            name: { type: String, required: true },
            at: { type: Date, required: true },
            uId: { type: String, required: true },
            note: String
        }],
    closes: [{
            id: { type: Number, required: true },
            at: { type: Date, required: true },
            uId: { type: String, required: true },
            note: String
        }]
}, { timestamps: { createdAt: 'at', updatedAt: 'upAt' } });
module.exports = mongoose.model(exports.ORG_NAME, OrgSchema);
//# sourceMappingURL=org.js.map