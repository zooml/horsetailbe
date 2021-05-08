var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DocumentSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    note: String,
    accounts: [{ id: String, amount: Number, note: String }],
    // img: { // https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
    //   ct: String, // content type
    //   data: Buffer
    // }
}, { timestamps: true });
// index documents.accounts.id
module.exports = mongoose.model('Document', DocumentSchema);
//# sourceMappingURL=document.js.map