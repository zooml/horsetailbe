"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_NAME = void 0;
var mongoose_1 = require("mongoose");
exports.USER_NAME = 'User';
var schema = new mongoose_1.Schema({
    email: { type: String, required: true },
    pswd: { type: String, required: true },
    salt: { type: Number, required: true },
    name: { type: String, required: true },
    opts: {},
    note: String
}, { timestamps: { createdAt: 'at', updatedAt: 'upAt' } });
schema.index({ email: 1 }, { unique: true });
exports.default = mongoose.model(exports.USER_NAME, schema);
//# sourceMappingURL=user.js.map