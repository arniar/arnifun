const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/user/wallet');
// Wallet routes
router.get('/', walletController.getWallet);
router.get('/balance', walletController.getBalance);

module.exports = router;
