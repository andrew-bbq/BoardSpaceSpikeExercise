var express = require('express');
const session = require('express-session');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');
const CreditCard = mongoose.model('CreditCard');
const Order = mongoose.model('Order');
const url = require('url');
const PDFDocument = require('pdfkit');
const fs = require('fs');

router.use(function(req, res, next) {
    res.locals.currentUser = req.session.user ? req.session.user : undefined;
    next();
});

router.get('/orderlist', function (req, res, next) {
    // only admins and staff can view this page
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.find({}).sort({priority:-1}).exec(function (err, orders) {
        return res.render('orderlist', { orders: orders });
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

// handle priority updates
router.post('/orderlist/priority', function(req, res, next) {
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.findByIdAndUpdate({_id: req.body.orderId}, {priority: req.body.priority}, function(err, order){
        if (err) return next(err);
        return res.redirect('/staff/orderlist')
    });
});

router.post('/query',function (req, res, next) {
    // only admins and staff can view this page
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    let startdate = req.body.queryStartDate;
    let enddate = req.body.queryEndDate;
    Order.find({time: {$gte: startdate, $lte: enddate}}).sort({priority:-1}).exec(function (err, orders) {
        return res.render('orderlist', { orders: orders });
    });
});

router.get('/usagereport', function (req, res, next) {
    // only admins and staff can view this page
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    let orderCount = 0;

    var query = Order.find(); 

    query.count(function (err, count) { 
        if (err) return next(err)
        orderCount = count; 
    });

    Order.find({}).sort({priority:-1}).exec(function (err, orders) {
        if (err) return next(err)
        MenuItem.find({}, function (err, menuItems) {
            if (err) return next(err)
            return res.render('usagereport', { orders: orders, orderCount: orderCount,itemOrderCount: 0, itemCount: 0, itemTotalPaid: 0, menuItems: menuItems});
        });
    });
});

router.post('/getUsageReport',function (req, res, next) {
    // only admins and staff can view this page
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    let queryItemCount = 0;
    let orderCount = 0;
    let itemOrderCount = 0;
    let itemTotalPaid = 0.0;

    let queryItem = req.body.queryItem;
    let startdate = req.body.queryStartDate;
    let enddate = req.body.queryEndDate;


    // getting count of orders
    var query = Order.find({/***/ time: {$gte: startdate, $lte: enddate} /***/}); 

    query.count(function (err, count) { 
        if (err) return next(err); 
        else {
            orderCount = count; 
        }
    }); 

    // getting id of selected menu item

    // let queryItemId;

    // MenuItem.findOne({name:queryItem}, function (err, menuItem) {
    //     if (err) return next(err); 
    //     queryItemId = menuItem.id;
    // });

    // MenuItem.find({name:queryItem}, function (err, menuItems) {
    //     menuItems.forEach(function(menuItem) {
    //         if (err) return next(err); 
    //         if(menuItem.name === queryItem) queryItemId = menuItem.id;
    //     });
    // });

    // getting count of selected menu item
    Order.find({/***/ time: {$gte: startdate, $lte: enddate} /***/}, function(err, orders) {
        if (err) return next(err);
        orders.forEach(function(order) {
            if (err) return next(err);
            let menuIds = [];
            for (let itemId in order.menuItems) menuIds.push(itemId); 
            MenuItem.find({ '_id': {$in: menuIds}, name:queryItem}, function(err, menuItems) {
                if (err) return next(err);
                for (let menuId in order.menuItems) {
                    menuItems.forEach(function(menuItem) {
                        if (menuId == menuItem.id) {
                            queryItemCount += order.menuItems[menuId];
                            itemOrderCount++;
                            itemTotalPaid += Number(menuItem.price)*Number(order.menuItems[menuId]).toFixed(2);
                        }
                    });
                }
            });
        });
    });

    Order.find({time: {$gte: startdate, $lte: enddate}}).sort({priority:-1}).exec(function (err, orders) {
        MenuItem.find({},function (err, menuItems) {
            return res.render('usagereport', { orders: orders, orderCount: orderCount, itemOrderCount: itemOrderCount, itemCount: queryItemCount, itemTotalPaid: itemTotalPaid.toFixed(2), menuItems: menuItems});
        });
    });
});

// handle priority updates
router.post('/usagereport/priority', function(req, res, next) {
    if (!req.session.user || (req.session.user.role != User.schema.path('role').enumValues[0] && req.session.user.role != User.schema.path('role').enumValues[2])) {
        return res.redirect('/');
    }
    Order.findByIdAndUpdate({_id: req.body.orderId}, {priority: req.body.priority}, function(err, order){
        if (err) return next(err);
        return res.redirect('/staff/usagereport')
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



router.post('/printViewOrder', function (req, res, next) {
    // Create a document
    const doc = new PDFDocument;

    let file = __dirname + '/../Receipts/ReceiptForOrder'+req.body.orderId+'.pdf';
    // pipe document to receipt pdf filestream
    let writeStream = fs.createWriteStream(file)
    doc.pipe(writeStream);
    
    doc.fontSize(30);
    doc.text("Thank you for ordering with BadgerBytes!");

    doc.fontSize(12);

    doc.text("Order#: " + req.body.orderId);
    doc.text("Items: " + req.body.itemList);
    doc.text("Amount Paid: $" + req.body.orderPrice);
    doc.text("Paid with card ending in: " + req.body.cardNumber);

    
    doc.text("Order Time: " + req.body.orderTime);
    doc.text("Pickup Time: " + req.body.pickupTime);

    doc.end();
    writeStream.on('finish', function () {
        res.download(file, "Receipt-"+req.body.orderId+".pdf", (err) => {
            if(err) {
                next(err);
            }
            fs.unlink(file, (err) => {
                if (err) {
                    next(err);
                }
            });
        });
    });
});

module.exports = router;