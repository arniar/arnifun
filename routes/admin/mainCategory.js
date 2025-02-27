

var express = require('express');
var router = express.Router();
const adminCategoryController = require('../../controllers/admin/mainCategory');

/* GET home page. */
router.get('/', adminCategoryController.getAdminCategory);

router.post('/table', adminCategoryController.postAdminCategoryTable);

router.patch('/Offer', adminCategoryController.patchMainCategoryOffer);

router.get('/search', adminCategoryController.getAdminCategorySearch);

router.post('/create', adminCategoryController.postAdminCategoryCreate);

router.post('/edit', adminCategoryController.postAdminCategoryEdit);

router.patch('/inactivate', adminCategoryController.patchInactivate);

router.patch('/activate', adminCategoryController.patchActivate);

router.delete('/delete', adminCategoryController.deleteCategory);

module.exports = router;
