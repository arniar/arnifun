var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  const authentication = req.session.isAuthenticated;
  res.render('home',{authentication});
});



module.exports = router;
