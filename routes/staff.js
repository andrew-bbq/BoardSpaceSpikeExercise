var express = require('express');
const session = require('express-session');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');
const CreditCard = mongoose.model('CreditCard');
const Order = mongoose.model('Order');
const url = require('url');

router.get('/orderlist', function (req, res, next) {
    // only admins and staff can view this page
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.find({}, function (err, orders) {
        res.render('orderlist', { orders: orders });
    });
});

router.get('/vieworder', function(req, res, next) {
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    let orderId = req.query.order;
    Order.findOne({_id: orderId}, function(err, order) {
        if (err) {
            return next(err);
        }
        User.findOne({_id: order.userId}, function(err, user){
            if (err) {
                return next(err);
            }
            let menuIds = [];
            for (let itemId in order.menuItems) {
                menuIds.push(itemId);
            }
            MenuItem.find({
                '_id': {$in: menuIds}},
                function(err, menuItems) {
                let cartDescription = [];
                for (let menuId in order.menuItems) {
                    menuItems.forEach(function(menuItem) {
                        if (menuId == menuItem.id) {
                            cartDescription.push({name: menuItem.name, count: order.menuItems[menuId]});
                        }
                    });
                }
                CreditCard.findOne({
                    '_id': order.cardId}, function(err, card){
                        res.render("vieworder", { order: order, menuItems: cartDescription, card: card, orderUser: user });
                });
            });
        });
    });
});

// handle status updates
router.post('/vieworder', function(req, res, next) {
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.findByIdAndUpdate({_id: req.body.orderId}, {status: req.body.status}, function(err, order){
        if (err){
            return next(err);
        }
        return res.redirect(url.format({ pathname: "/staff/vieworder", query: { "order": req.body.orderId } }))
    });
});

// handle status updates
router.post('/orderlist', function(req, res, next) {
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.findByIdAndUpdate({_id: req.body.orderId}, {status: req.body.status}, function(err, order){
        if (err){
            return next(err);
        }
        return res.redirect('/staff/orderlist')
    });
});

module.exports = router;