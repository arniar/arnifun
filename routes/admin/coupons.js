// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/admin/coupons');

// Render the admin coupons page
router.get('/', (req, res) => {
    res.render('../views/pages/admin/coupons');
});


// GET all coupons with pagination
router.get('/get', couponController.getCoupons);

router.get('/:id', couponController.getCoupon);

// POST create new coupon
router.post('/add', couponController.addCoupon);

// PATCH update existing coupon
router.patch('/:id', couponController.updateCoupon);

// DELETE coupon
router.delete('/:id', couponController.deleteCoupon);



module.exports = router;