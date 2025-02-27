// routes/user/payment.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderOverview');

router.get('/:orderId', orderController.getOrderDetails);
router.get('/:orderId/invoice', orderController.generateInvoice);
router.post('/:orderId/retry-payment',  orderController.retryPayment);
router.post('/verify-retry-payment', orderController.verifyRetryPayment);
router.post('/:orderId/refund', orderController.createRefundRequest);
router.post('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;