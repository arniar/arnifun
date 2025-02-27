// routes/subcategory.js
var express = require('express');
var router = express.Router();
const subcategoryController = require('../../controllers/admin/subCategory');

router.get('/', subcategoryController.getHomePage);
router.post('/table', subcategoryController.getTableData);
router.patch('/offer', subcategoryController.updateOffer);
router.get('/search', subcategoryController.searchSubCategories);
router.post('/create', subcategoryController.createSubCategory);
router.post('/edit', subcategoryController.editSubCategory);
router.patch('/inactivate', subcategoryController.inactivateSubCategory);
router.patch('/activate', subcategoryController.activateSubCategory);
router.delete('/delete', subcategoryController.deleteSubCategory);

module.exports = router;