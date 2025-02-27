// routes/cartRoutes.js
var express = require('express');
var router = express.Router();
var cartController = require('../../controllers/user/cart');

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.post('/update-quantity', cartController.updateQuantity);
router.delete('/remove-item', cartController.removeItem);
router.post('/apply-coupon', cartController.applyCoupon);
router.post('/clear-coupon', cartController.clearCoupon);

module.exports = router;