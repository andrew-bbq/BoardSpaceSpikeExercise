var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const url = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.render('login', {err: req.query.err, username: req.query.username});
});

router.post('/login', function(req, res, next) {
  let errorMessage = "";
  let tempUser;
  User.findOne({username: req.body.username}, function(err, user) {
    if (user) {
      if (user.password == req.body.password) {
        req.session.user = user;
      } else {
        errorMessage = "Invalid password for account.";
      }
    } else {
      errorMessage = "No account with username.";
    }
    if (errorMessage.length > 0) {
      return res.redirect(url.format({pathname:"/users/login", query: {"err": errorMessage, "username" : req.body.username}}));
    }
    return res.redirect("/");
  });
});

router.get('/createuser', function(req, res, next) {
    res.render('createuser', {err: req.query.err, username: req.query.username});
});
  
router.post('/createuser', function(req, res, next) {
  if (req.body.username && req.body.password && req.body.passwordConf) {
    let userData = {
      username: req.body.username,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      aptsuite: req.body.aptsuite,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      role: User.schema.path('role').enumValues[1]
    };
  
    if (req.body.password != req.body.passwordConf) {
      return res.redirect(url.format({pathname:"/users/createuser", query: {"err": "Passwords did not match", "username" : req.body.username}}));
    }
  
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/');
      }
    });
  }
});
  
router.get('/customerAccount', function(req, res, next) {
  res.render('customerAccount');
});


module.exports = router;
