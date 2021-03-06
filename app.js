const mongoose = require('mongoose');
const session = require('express-session');
const mongoDB = 'mongodb+srv://admin:pdXkO6K3gc5FUzwS@sedb.ibcq2.mongodb.net/SEDB?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db =  mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
require("./models/user.model");
require("./models/menuitem.model");
require("./models/creditcard.model");
require("./models/order.model");
require("./models/messages.model");

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var menuRouter = require('./routes/menu');
var orderRouter = require('./routes/order');
var staffRouter = require('./routes/staff');
var messagesRouter = require('./routes/messages');

var app = express();

app.use(session({
  key: 'user_sid',
  secret: 'idkwhatgoeshere',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1200000
  }
}));

// view engine setup
app.set('views',
  [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views/staff'),
    path.join(__dirname, 'views/order'),
    path.join(__dirname, 'views/menu'),
    path.join(__dirname, 'views/users'),
    path.join(__dirname, 'views/messages')
  ]
);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/menu', menuRouter);
app.use('/order', orderRouter);
app.use('/staff', staffRouter);
app.use('/messages', messagesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
