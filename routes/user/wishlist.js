// routes/user/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/user/wishlist');

router.get('/', wishlistController.getWishlist);
router.post('/toggle', wishlistController.toggleWishlistItem);
router.get('/check/:variantId', wishlistController.checkWishlistItem);
router.delete('/item/:variantId', wishlistController.removeWishlistItem);


module.exports = router;