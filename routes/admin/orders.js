const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/admin/orders');


router.get('/', function (req, res) {
    res.render('../views/pages/admin/orders');
})
// Get all orders
router.get('/get', OrderController.getAllOrders);

// Update order status
router.put('/:id/status', OrderController.updateOrderStatus);


router.post('/:id/refund-A',OrderController.approveRefund)

router.post('/:id/refund-R',OrderController.rejectRefund)

module.exports = router;