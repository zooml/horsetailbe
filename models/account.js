var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AccountSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    number: { type: String, required: true, unique: true },
    desc: String,
    credit: Boolean,
    parentId: String,
    amount: { type: Number, default: 0.0 }, // required if leaf
    // funds: [{fund: String, amount: Number}]
}, { timestamps: true });
module.exports = mongoose.model('Account', AccountSchema);
//# sourceMappingURL=account.js.map