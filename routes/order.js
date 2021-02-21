var express = require('express');
const session = require('express-session');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');
const CreditCard = mongoose.model('CreditCard');
const url = require('url');

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

router.get('/paymentinfo', function(req, res, next) {
    CreditCard.find({userId: req.session.user._id}, function(err, paymentMethods) {
        let cart = (req.session.cart) ? req.session.cart : {};
        res.render('paymentinfo', {cards: paymentMethods, cart: cart});
    });
});

router.get('/addpaymentmethod', function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    // adding error parameter in case someone wants to add validation functions in the future - we don't have time for it but just in case
    res.render('addpaymentmethod', {err: req.query.err});
});

router.post('/addpaymentmethod', function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    if (req.body.name && req.body.cardnumber && req.body.ccv && req.body.expmonth && req.body.expyear) {
        let cardData = {
            userId: req.session.user._id,
            cardNumber: req.body.cardnumber,
            ccv: req.body.ccv,
            expirationMonth: req.body.expmonth,
            expirationYear: req.body.expyear,
            holderName: req.body.name
        };

        CreditCard.create(cardData, function(err, user) {
            if (err) {
                return next(err);
            } else {
                return res.redirect("/order/paymentinfo");
            }
        })
    }
});

router.post('/cardsubmit', function(req, res, next) {
    if(req.body.action == "Delete") {
        CreditCard.deleteOne({_id: req.body.toUse}, function(err) {
            return res.redirect("/order/paymentinfo");
        });
    } else if (req.body.action == "Use this card") {
        return res.redirect(url.format({pathname:"/order/completepayment", query: {"card": req.body.toUse}}))
    }
    console.log(req.body.action);
});

router.get('/completepayment', function(req, res, next) {
    let cart = (req.session.cart) ? req.session.cart : {};
    if (cart.length == 0) {
        res.redirect('/');
    }
    CreditCard.findOne({_id: req.query.card}, function(err, cardObject) {
        if (err) {
            next(err);
        }
        res.render("completepayment", {card: cardObject, cart: cart});
    });
});

module.exports = router;