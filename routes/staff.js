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

router.post('/ordermenu', function (req, res, next) {
    if (!req.session.cart) {
        req.session.cart = {};
    }
    itemId = req.body.itemId;
    itemPrice = req.body.itemPrice;
    itemName = req.body.itemName;
    if (!req.session.cart[itemId]) {
        let cartItem = { count: 1, name: itemName, price: itemPrice };
        req.session.cart[itemId] = cartItem;
    } else {
        req.session.cart[itemId].count++;
    }
    return res.redirect('/order/ordermenu');
});

module.exports = router;