let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: { type: String },
        password: { type: String },
    }
);

// first_name: { type: String, unique: true, required: true },
// last_name: { type: String },
// membership_status: { type: Boolean },
// message: { type: String },

UserSchema
    .virtual('url')
    .get(function () {
        return '/user/' + this._id;
    });

module.exports = mongoose.model('User', UserSchema);