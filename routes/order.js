var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');

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
    itemId = req.body.itemId;
    itemPrice = req.body.itemPrice;
    itemName = req.body.itemName;
    if (!req.session.cart[itemId]) {
        let cartItem = {count: 1, name: itemName, price: itemPrice};
        req.session.cart[itemId] = cartItem;
    } else {
        req.session.cart[itemId].count++;
    }
    return res.redirect('/order/ordermenu');
});

router.get('/viewmenu', function(req, res, next) {
    MenuItem.find({}, function(err, menuItems) {
        res.render('viewmenu', {menuItems: menuItems});
    });
});

router.post('/startorder', function(req, res, next) {
    return res.redirect("/order/paymentinfo");
});

router.get('/order/paymentinfo', function(req, res, next) {

});

module.exports = router;