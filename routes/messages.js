var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const Messages = mongoose.model('Messages');

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

router.get('/messages', function(req, res, next) {
    if(!req.session.user) {
        return res.redirect('/');
    }
    Messages.findOne({userId: req.session.user._id}, function(err, messages) {
        // if (err) {
        //     console.log(err);
        //     return res.redirect("/messages/messages");
        // }
        let cleanMessages = messages ? messages.messages : [];
        res.render('messages', {messages: cleanMessages});
    });
});

module.exports = router;