let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MessageSchema = new Schema(
    {
        title: { type: String, required: true, maxlength: 20 },
        timestamp: { type: Date },
        text: { type: String, required: true, maxlength: 280 }, //using twitter's character limit
    }
);

// MessageSchema
//     .virtual('url')
//     .get(function () {
//         return '/message/' + this._id;
//     });

module.exports = mongoose.model('Message', MessageSchema);