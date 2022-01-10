const User = require('../models/user');
const Message = require('../models/message');
const passport = require('../passport');
const bcrypt = require('bcryptjs');
let async = require('async');

exports.user_id_get = (req, res, next) => {
    console.log(res.locals.currentUser, 'userid GET')
    if (res.locals.currentUser === undefined) {
        res.redirect('/');
    }
    res.render('userpage');
}

exports.user_id_post = (req, res, next) => {
    console.log(res.locals.currentUser, 'userid POST')
    res.send('a');
}