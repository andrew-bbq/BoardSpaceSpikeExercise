var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');

module.exports = router;

router.get('/', function(req, res, next) {
    /**if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }*/
    if(req.session.user) {
        return res.redirect('/order/ordermenu');
    } else {
        return res.redirect('/order/viewmenu');
    }
});

router.get('/ordermenu', function(req, res, next) {
    MenuItem.find({}, function(err, menuItems) {
        res.render('ordermenu', {menuItems: menuItems});
    });
});

router.post('/ordermenu', function(req, res, next) {
    if (!req.session.cart) {
        req.session.cart = {};
    }
    MenuItem.find({}, function(err, menuItems) {
        res.render('ordermenu', {menuItems: menuItems});
    });
});

router.get('/viewmenu', function(req, res, next) {
    MenuItem.find({}, function(err, menuItems) {
        res.render('viewmenu', {menuItems: menuItems});
    });
});