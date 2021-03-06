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

router.get('/', function (req, res, next) {
    if (req.session.user) {
        return res.redirect('/order/ordermenu');
    } else {
        return res.redirect('/order/viewmenu');
    }
});

router.get('/ordermenu', function (req, res, next) {
    MenuItem.find({}, function (err, menuItems) {
        res.render('ordermenu', { menuItems: menuItems });
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

router.get('/viewmenu', function (req, res, next) {
    MenuItem.find({}, function (err, menuItems) {
        res.render('viewmenu', { menuItems: menuItems });
    });
});

router.post('/startorder', function (req, res, next) {
    return res.redirect("/order/paymentinfo");
});

router.get('/paymentinfo', function (req, res, next) {
    CreditCard.find({ userId: req.session.user._id }, function (err, paymentMethods) {
        let cart = (req.session.cart) ? req.session.cart : {};
        res.render('paymentinfo', { cards: paymentMethods, cart: cart });
    });
});

router.get('/addpaymentmethod', function (req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    // adding error parameter in case someone wants to add validation functions in the future - we don't have time for it but just in case
    res.render('addpaymentmethod', { err: req.query.err });
});

router.post('/addpaymentmethod', function (req, res, next) {
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

        CreditCard.create(cardData, function (err, user) {
            if (err) {
                return next(err);
            } else {
                return res.redirect("/order/paymentinfo");
            }
        })
    }
});

router.post('/cardsubmit', function (req, res, next) {
    if (req.body.action == "Delete") {
        CreditCard.deleteOne({ _id: req.body.toUse }, function (err) {
            return res.redirect("/order/paymentinfo");
        });
    } else if (req.body.action == "Use this card") {
        return res.redirect(url.format({ pathname: "/order/completepayment", query: { "card": req.body.toUse } }))
    }
    console.log(req.body.action);
});

router.get('/completepayment', function (req, res, next) {
    let cart = (req.session.cart) ? req.session.cart : {};
    if (cart.length == 0) {
        res.redirect('/');
    }
    CreditCard.findOne({ _id: req.query.card }, function (err, cardObject) {
        if (err) {
            next(err);
        }
        res.render("completepayment", { card: cardObject, cart: cart });
    });
});

router.post('/completepayment', function (req, res, next) {
    const price = req.body.price;
    const cardId = req.body.card;
    const userId = req.session.user._id;
    const pickup = req.body.pickup == 1;
    const timetopickup = req.body.timetopickup;
    const car = req.body.car ? req.body.car : "";
    let menuItems = {};
    for (let itemId in req.session.cart) {
        menuItems[itemId] = req.session.cart[itemId].count;
    }
    const orderData = {
        userId: userId,
        cardId: cardId,
        price: price,
        pickup: pickup,
        timetopickup: timetopickup,
        car: car,
        menuItems: menuItems,
        status: Order.schema.path('status').enumValues[0],
        time: Date.now()
    };
    Order.create(orderData, function (err, order) {
        if (err) {
            return next(err);
        } else {
            delete(req.session.cart);
            return res.redirect(url.format({ pathname: "/order/trackorder", query: { "order": order.id } }));
        }
    });
});

router.get("/trackorder", function(req, res, next) {
    Order.findOne({_id: req.query.order}, function(err, order) {
        if(err) {
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
                        res.render("trackorder", { order: order, menuItems: cartDescription, cardNumber:(Number(card.cardNumber)%10000) });
                });
        });
    });

});

router.post('/print', function (req, res, next) {
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