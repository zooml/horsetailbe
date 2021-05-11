var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TxnDocSchema = new Schema({
    oId: { type: String, required: true },
    uId: { type: String, required: true },
    kind: { type: String, required: true },
    effAt: { type: Date, required: true },
    accts: [{
            id: { type: String, required: true },
            amt: { type: Number, required: true },
            note: String
        }],
    note: String,
    // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
    //   ct: String, // content type
    //   data: Buffer
    // }
}, { timestamps: { createdAt: 'at', updatedAt: 'upAt' } });
// index documents.accounts.id
module.exports = mongoose.model('TxnDoc', TxnDocSchema);
//# sourceMappingURL=txndoc.js.map