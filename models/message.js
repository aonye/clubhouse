let mongoose = require('mongoose');
const { DateTime } = require("luxon");

let Schema = mongoose.Schema;

let MessageSchema = new Schema(
    {
        title: { type: String, required: true, maxlength: 20 },
        timestamp: { type: Date, required: true },
        text: { type: String, required: true, maxlength: 280 }, //using twitter's character limit
        user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        index: { type: Number },
    }
);

// MessageSchema
//     .virtual('url')
//     .get(function () {
//         return '/message/' + this._id;
//     });

MessageSchema
    .virtual('date_formatted')
    .get(function () {
        return DateTime.fromJSDate(this.date_of_birth).toISODate(DateTime.DATE_SHORT);
    });

module.exports = mongoose.model('Message', MessageSchema);