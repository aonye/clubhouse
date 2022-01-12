const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');
const passport = require('../passport');
const bcrypt = require('bcryptjs');
const { DateTime, Settings } = require('luxon');

Settings.defaultZoneName = "America/New York";

//block access to index/login/signup when logged in
exports.index = (req, res) => { //index
    //console.log(res.locals.currentUser, 'index GET')
    if (res.locals.currentUser !== undefined) {
        res.redirect('/messageboard');
    }
    res.render('index');
};

exports.login_get = (req, res) => {
    //console.log(res.locals.currentUser, 'login GET')
    if (res.locals.currentUser !== undefined) {
        res.redirect('/messageboard');
    }
    res.render('login');
};

exports.login_post = passport.authenticate("local", {
    successRedirect: "/messageboard",
    failureRedirect: "/login",
});

exports.signup_get = (req, res) => {
    //console.log(res.locals.currentUser, 'signup GET')
    if (res.locals.currentUser !== undefined) {
        res.redirect('/messageboard');
    }
    res.render('signup', { user: res.locals.currentUser });
};

exports.signup_post = [
    body('first_name').trim().isLength({ min: 1, max: 20 }).withMessage('First name is too long').escape(),
    body('last_name').trim().isLength({ min: 1, max: 20 }).withMessage('Last name is too long').escape(),
    body('username').trim()
        .isLength({ min: 1, max: 30 }).withMessage('Entry is too long.')
        .isEmail().withMessage('Entry is not an email.')
        .custom((username) => {
            return User.findOne({ username }).then((productName) => {
                if (productName) {
                    return Promise.reject('Username (email) is already taken.');
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
    body('membership').trim(),
    body('admin_status').trim().isBoolean({ loose: true }),

    (req, res, next) => {

        const errors = validationResult(req);

        let user = new User(
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                password: req.body.password,
            });

        user.membership_status = req.body.membership === process.env.SECRET ? true : false;
        user.admin_status = req.body.admin_status === 'True' ? true : false;

        if (!errors.isEmpty()) {
            res.render('signup', { user, admin_result: req.body.admin_status, errors: errors.array() });
            return;
        }

        bcrypt.hash(user.password, 5, (err, hashedPassword) => {
            if (err) { return next(err) }
            else { //store hashpw in db, save user
                user.password = hashedPassword;
                user.save(err => {
                    if (err) { return next(err); }
                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/messageboard');
                    });
                });
            }
        });
    }
];

exports.logout_get = (req, res) => {
    req.logout();
    res.redirect('/login');
};

exports.messageboard_get = async (req, res) => { //private route
    const messages = await Message.find({}).populate('user').sort('timestamp');
    for (let i = 0; i < messages.length; i++) { //iterate through messages in O(n) and assign an index
        messages[i].index = i;
    }
    if (res.locals.currentUser === undefined) {
        res.redirect('/');
    }
    res.render('messageboard', { user: res.locals.currentUser, messages });
};

exports.messageboard_post = [
    body('title').trim().isLength({ min: 1, max: 20 }).withMessage('Title must be between 1 and 20 characters in length').escape(),
    body('text').trim().isLength({ min: 1, max: 280 }).withMessage('Text must be between 1 and 280 characters in length').escape(),

    async (req, res, next) => {
        const user = await User.findById(res.locals.currentUser.id);

        if (!user) {
            res.redirect('/messageboard');
        }

        const errors = validationResult(req);

        const datetime = DateTime.local();

        const message = new Message({
            title: req.body.title,
            timestamp: datetime.toISO(),
            text: req.body.text,
            user,
        });

        console.log(message.timestamp);

        if (!errors.isEmpty()) {
            const messages = await Message.find({}).populate('user').sort('timestamp');
            for (let i = 0; i < messages.length; i++) { //iterate through messages in O(n) and assigns an index
                messages[i].index = i;
            }
            if (!res.locals.currentUser) {
                res.redirect('/');
            }
            res.render('messageboard', { user, messages, message, errors: errors.array() });
            return;
        }

        message.save(err => {
            if (err) { return next(err); }
            return res.redirect('/messageboard');
        });
    }
];

exports.messageboard_delete_get = async (req, res, next) => { //private route
    if (res.locals.currentUser === undefined) {
        res.redirect('/');
    }
    Message.findByIdAndDelete(req.params.id, (err) => {
        if (err) { return next(err); }
        res.redirect('/messageboard');
    });
};