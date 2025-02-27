var express = require('express');
var router = express.Router();

const dashboardRouter = require('./admin/dashboard');
const productsRouter = require('./admin/products');
const variantRouter = require('./admin/variant');
const mainCategoryRouter = require('./admin/mainCategory');
const subcategoryRouter = require('./admin/subCategory');
const ordersRouter = require('./admin/orders');
const couponRouter = require('./admin/coupons');
const userRouter = require('./admin/users');
const salesRouter = require('./admin/sales');
const bannerRouter = require('./admin/banner');


const authMiddleware = require('../middlewares/adminLoginCheck');

// Apply middleware to all routes
 router.use(authMiddleware);

router.use('/dashboard', dashboardRouter);
router.use('/products', productsRouter);
router.use('/variant', variantRouter);
router.use('/maincategories', mainCategoryRouter);
router.use('/subcategories', subcategoryRouter);
router.use('/orders', ordersRouter);
router.use('/coupons', couponRouter);
router.use('/users', userRouter);
router.use('/sales', salesRouter);
router.use('/banner', bannerRouter);


router.post('/logout', async (req, res) => {
    try {
        // Only clear admin-specific session data
        req.session.isChecked = false;  // Clear admin authentication
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error during logout' });
    }
});

module.exports = router;
