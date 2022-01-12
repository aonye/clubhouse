let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        membership_status: { type: Boolean, default: false, required: true },
        admin_status: { type: Boolean, default: false, required: true },
    }
);

// UserSchema
//     .virtual('url')
//     .get(function () {
//         return '/user/' + this._id;
//     });

UserSchema
    .virtual('admin_array')
    .get(() => {
        return ['True', 'False']
    });

module.exports = mongoose.model('User', UserSchema);