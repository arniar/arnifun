const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/admin/banner');


router.get('/', bannerController.getBannerManager);
router.get('/banners', bannerController.getBanners);
router.post('/banners', bannerController.createBanner);
router.put('/banners/:id', bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);
router.put('/banner/order', bannerController.updateOrder);
router.patch('/banner/:id/toggle', bannerController.toggleBannerStatus);


module.exports = router;