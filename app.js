const createError = require('http-errors');
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const passport = require('./passport');

//mongoose/ORM stuff
const mongoose = require("mongoose");
const mongoDB = `mongodb+srv://aonye:aonye@cluster0.ha8pn.mongodb.net/Clubhouse?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//encryption
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//setup encrypion
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function (req, res, next) { //sets the res object with user
    res.locals.currentUser = req.user;
    next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;