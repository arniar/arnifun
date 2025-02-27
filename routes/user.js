var express = require('express');
var router = express.Router();

const PIRouter = require('./user/personalInformation');
const ADRRouter = require('./user/manageAddress');
const cartRouter = require('./user/cart');
const checkoutRouter = require('./user/checkout');
const orderRouter = require('./user/orders');
const wishlist = require('./user/wishlist');
const wallet = require('./user/wallet');
const orderOverview = require('./user/orderOverview');


const isAuthenticated = require('../middlewares/userLoginCheck');



// Apply authentication middleware
router.use(isAuthenticated);


router.use('/pI', PIRouter);
router.use('/adr', ADRRouter);
router.use('/cart', cartRouter);
router.use('/checkout', checkoutRouter);
router.use('/order', orderRouter);
router.use('/wishlist', wishlist);
router.use('/wallet', wallet);
router.use('/orderOverview', orderOverview);

router.post('/logout', async (req, res) => {
    try {
        // Only clear admin-specific session data
        req.session.isAuthenticated = false;  // Clear admin authentication
        
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error during logout' });
    }
});

module.exports = router;
