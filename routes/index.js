var express = require('express');
var router = express.Router();

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

module.exports = router;