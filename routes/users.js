var express = require('express');
const session = require('express-session');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');
const url = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
  let errorMessage = "";
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
      return res.redirect(url.format({pathname:"/", query: {"err": errorMessage, "username" : req.body.username}}));
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
        req.session.user = user;
        return res.redirect('/');
      }
    });
  }
});
  
router.get('/customerAccount', function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('customerAccount', {user: req.session.user});
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});


router.get('/cart', function(req, res, next) {
  let cart = (req.session.cart) ? req.session.cart : {};
  res.render('cart', {cart: cart});
});

router.post('/cart', function(req, res, next) {
  let itemId = req.body.itemId;
  delete(req.session.cart[itemId]);
  return res.redirect('/users/cart');
});

router.post('/updateusername', function(req, res, next) {
  let newUsername = req.body.newUsername;
  User.findByIdAndUpdate({_id: req.session.user._id}, {username: newUsername}, function(err, user){
    if (err) {
      next(err);
    }
    // update session
    User.findOne({_id: user._id}, function(err, user2){
      if (err) {
        next(err);
      }
      req.session.user = user2;
      return res.redirect('/users/customeraccount')
    });
  });
});


router.post('/updatepassword', function(req, res, next) {
  let pass = req.body.newPassword;
  let confPass = req.body.confirmPassword;
  if (pass != confPass) {
    return res.redirect('/users/customeraccount');
  }
  User.findByIdAndUpdate({_id: req.session.user._id}, {password: pass}, function(err, user){
    if (err) {
      next(err);
    }
    // update session
    User.findOne({_id: user._id}, function(err, user2){
      if (err) {
        next(err);
      }
      req.session.user = user2;
      return res.redirect('/users/customeraccount');
    });
  });
});

router.post('/updatephone', function(req, res, next) {
  let newPhone = req.body.newPhone;
  User.findByIdAndUpdate({_id: req.session.user._id}, {phone: newPhone}, function(err, user){
    if (err) {
      next(err);
    }
    // update session
    User.findOne({_id: user._id}, function(err, user2){
      if (err) {
        next(err);
      }
      req.session.user = user2;
      return res.redirect('/users/customeraccount');
    });
  });
});

router.post('/updateaddress', function(req, res, next) {
  let address = req.body.address;
  let aptsuite = req.body.aptsuite;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;
  User.findByIdAndUpdate({_id: req.session.user._id}, {address: address, aptsuite: aptsuite, city: city, state: state, zip: zip}, function(err, user){
    if (err) {
      next(err);
    }
    // update session
    User.findOne({_id: user._id}, function(err, user2){
      if (err) {
        next(err);
      }
      req.session.user = user2;
      return res.redirect('/users/customeraccount');
    });
  });
});

module.exports = router;
