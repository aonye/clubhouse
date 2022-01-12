const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.user_update_get = async (req, res) => {
    //console.log(res.locals.currentUser, 'userid GET')
    if (res.locals.currentUser === undefined) {
        res.redirect('/');
    }
    const user = await User.findById(req.params.id).orFail(() => Error('User not found'));
    res.render('userpage', { user });
}

exports.user_update_post = [
    body('first_name').trim().isLength({ min: 1, max: 20 }).withMessage('First name is too long').escape(),
    body('last_name').trim().isLength({ min: 1, max: 20 }).withMessage('Last name is too long').escape(),
    body('username').trim()
        .isLength({ min: 1, max: 30 }).withMessage('Entry is too long.')
        .isEmail().withMessage('Entry is not an email.')
        .custom((username, { req }) => {
            return User.findById(req.params.id).then((user) => { // check if the name is unchanged
                if (user.username === username) {
                    console.log('same name')
                    return Promise.resolve();
                } else {
                    return User.findOne({ username }).then((res) => { //check if name is already taken
                        if (res) {
                            console.log('already taken')
                            return Promise.reject('Username (email) is already taken.');
                        }
                    });
                }
            });
        })
        .escape(),
    body('password').trim().isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 chars'), //don't escape (mutates pw)
    body('confirmpw').trim().isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 chars')
        .custom((confirmpw, { req }) => {
            if (confirmpw !== req.body.password) {
                throw new Error('Passwords must match');
            }
            return true;
        }),
    body('membership', 'Must not be empty').trim().escape(),

    async (req, res, next) => {
        const status = await User.findById(req.params.id, 'admin_status');
        console.log(status);
        const errors = validationResult(req);

        let user = new User(
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                password: req.body.password,
                membership_status: false,
                admin_status: status.admin_status,
                _id: req.params.id,
            });

        user.membership_status = req.body.membership === process.env.SECRET ? true : false;

        if (!errors.isEmpty()) {
            res.render('userpage', { user, errors: errors.array() });
            return;
        }

        bcrypt.hash(user.password, 5, (err, hashedPassword) => {
            if (err) { return next(err) }
            else { //store hashpw in db, save user
                user.password = hashedPassword;
                User.findByIdAndUpdate(req.params.id, user, {}, (err, result) => {
                    if (err) { return next(err); }
                    return res.redirect('/messageboard');
                });
            }
        });
    }
];