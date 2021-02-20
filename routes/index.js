var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Badger Bytes' });
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