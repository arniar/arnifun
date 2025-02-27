// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orders');

// Get all orders for the logged-in user
router.get('/', orderController.getAllOrders);

// Get order details
router.get('/:orderId', orderController.getOrderDetails);

// Cancel order
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;