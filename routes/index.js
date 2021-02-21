var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
  res.locals.currentUser = req.session.user ? req.session.user : undefined;
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  let user;
  if(req.session.user) {
    user = req.session.user;
  }
  res.render('index', { username: req.query.username, err: req.query.err, user: user });
});

router.get('/userlist', function(req,res) {
  let db = req.db;
  let collection = db.get('usercollection');
  collection.find({}, {}, function(e, docs) {
    res.render('userlist', {
      "userlist" : docs
    })
  });
});

router.post('/', function(req,res, next) {
  if(req.body.action == "Logout"){
    // go to home and remove user from session
    delete(req.session.user);
    return res.redirect("/");
  }
})

module.exports = router;