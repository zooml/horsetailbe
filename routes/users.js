var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({'1234': {id: '1234', name: 'Joe'}});
});

module.exports = router;
