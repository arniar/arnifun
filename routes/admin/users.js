var express = require('express');
var router = express.Router();
var userController = require('../../controllers/admin/users');

/* GET home page. */
router.get('/', userController.getUsersPage);
router.post('/table', userController.getUsersTable);
router.post('/block', userController.blockUser);
router.post('/unblock-user', userController.unblockUser);


module.exports = router;