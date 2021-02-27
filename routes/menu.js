var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const User = mongoose.model('User');
const MenuItem = mongoose.model('MenuItem');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const url = require('url');

router.use(function(req, res, next) {
    res.locals.currentUser = req.session.user ? req.session.user : undefined;
    next();
});

/* GET home page. */
router.get('/addmenuitem', function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    res.render('addmenuitem');
});

router.post('/addmenuitem', upload.single('image'), function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    const filePath = path.join('uploads/' + req.file.filename);
    let itemData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: {
            data: fs.readFileSync(path.join('uploads/' + req.file.filename)),
            contentType: req.file.mimetype
        },
        inStock: true
    };
    // add item to database
    MenuItem.create(itemData, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            // delete file
            fs.unlink(filePath, (err) => {
                if(err) {
                    return next(err)
                }
                res.redirect("/menu/editmenu");
            });
        }
    });
});

router.get('/editmenu', function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    MenuItem.find({}, function(err, menuItems) {
        res.render('editmenu', {menuItems: menuItems});
    });
});

router.post('/editmenu', function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    if(req.body.action == "Edit"){
        // go to edit page
        return res.redirect(url.format({pathname:"/menu/editmenuitem", query: {toEdit: req.body.toEdit}}));
    }
    if(req.body.action == "Delete") {
        MenuItem.deleteOne({_id: req.body.toEdit}, function(err) {
            if (err) {
                return next(err);
            }
        });
    }
    let inStock = (req.body.instock == 1);
    MenuItem.findByIdAndUpdate(
        {_id: req.body.toEdit},
        {inStock: inStock},
        function(err, result) {
            if(err) {
                return next(err);
            }
            return res.redirect('/menu/editmenu');
        }
    )

});

router.get('/editmenuitem', function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    MenuItem.findOne({_id: req.query.toEdit}, function(err, menuItem){
        if (err) {
            console.log(err);
            return res.redirect("/menu/editmenu");
        }
        res.render('editmenuitem', {menuItem: menuItem});
    });
});

router.post('/editmenuitem', function(req, res, next) {
    if(!req.session.user || req.session.user.role != User.schema.path('role').enumValues[0]) {
        return res.redirect('/');
    }
    MenuItem.findByIdAndUpdate(
        {_id: req.body.itemId},
        {name: req.body.name, description: req.body.description, price: req.body.price},
        function(err, result) {
            if (err) {
                console.log(err);
            }
            return res.redirect('/menu/editmenu');
        }
    );
});

module.exports = router;