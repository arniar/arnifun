const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/user/checkout');

router.get('/', checkoutController.getCheckoutPage);
router.post('/addresses', checkoutController.createAddress);
router.patch('/addresses/:id', checkoutController.editAddress);
router.delete('/addresses/:id', checkoutController.deleteAddress);
router.get('/addresses', checkoutController.getAllAddresses);
router.patch('/addresses/:id/primary', checkoutController.setPrimaryAddress);
router.get('/addresses/primary', checkoutController.getPrimaryAddress);
router.post('/place-order', checkoutController.placeOrder);
router.post('/create-razorpay-order', checkoutController.createRazorpayOrder);
router.post('/verify-payment', checkoutController.verifyPayment);
router.get('/wallet/balance', checkoutController.getWalletBalance);
router.post('/wallet/pay', checkoutController.processWalletPayment);

module.exports = router;