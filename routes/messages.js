var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const Messages = mongoose.model('Messages');

// admin access
router.post('/staffmessages', function(req, res, next) {
    Messages.count({userId: req.body.userId}, function(err, count) {
        console.log(count);
        if(count == 0) {
            if((req.session.user.role == 'admin' || req.session.user.role == 'staff')) {
                let MessageData = {
                    userId: req.body.userId,
                    messages: [{sentByUser: false, message: req.body.message, time: Date.now()}]
                };
            }
            Messages.create(
                MessageData,
                function(err, messages) {
                    if(err){
                        return next(err);
                    }
                    res.redirect('/messages/staffmessages?userId='+ req.body.userId);
                });
        }
        else {
            if((req.session.user.role == 'admin' || req.session.user.role == 'staff')) {
                Messages.findOneAndUpdate({userId: req.body.userId},
                {$push: {messages: {sentByUser: false, message: req.body.message, time: Date.now()}}},
                function (err, messages) {
                    res.redirect('/messages/staffmessages?userId='+ req.body.userId);
                });
            }
        }
    });
});

// user access
router.post('/messages', function(req, res, next) {
    Messages.count({userId: req.session.user._id}, function(err, count) {
        console.log(count);
        if(count == 0) {
            let MessageData = {
                userId: req.session.user._id,
                messages: [{sentByUser: true, message: req.body.message, time: Date.now()}]
            };
            Messages.create(
                MessageData,
                function(err, messages) {
                    if(err){
                        return next(err);
                    }
                    res.redirect('/messages/messages');
                });
        }
        else {
            Messages.findOneAndUpdate({userId: req.session.user._id},
                {$push: {messages: {sentByUser: true, message: req.body.message, time: Date.now()}}},
                function (err, messages) {
                    res.redirect('/messages/messages');
                });
        }
    });
});


// admin access
router.get('/staffmessages', function(req, res, next) {
    if(!req.session.user || (req.session.user.role != 'admin' && req.session.user.role != 'staff')) {
        return res.redirect('/');
    }
    Messages.findOne({userId: req.query.userId}, function(err, messages) {
        if(err) {
            next(err);
        }
        let cleanMessages = messages ? messages.messages : [];
        res.render('staffmessages', {messages: cleanMessages, userId: req.query.userId});
    });
});

// user access
router.get('/messages', function(req, res, next) {
    if(!req.session.user) {
        return res.redirect('/');
    }
    Messages.findOne({userId: req.session.user._id}, function(err, messages) {
        if (err) {
            next(err);
        }
        let cleanMessages = messages ? messages.messages : [];
        // sort messages
        cleanMessages.sort(function(a, b) {return (a.time > b.time) ? 1 : -1});
        res.render('messages', {messages: cleanMessages});
    });
});

module.exports = router;