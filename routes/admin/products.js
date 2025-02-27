const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/products');



// Main routes
router.get('/', productController.getHomePage);
router.post('/table', productController.getProductsTable);

// Product management routes
router.get('/addProduct', productController.getAddProductPage);
router.post('/addProduct', productController.addProduct);


router.post('/edit', productController.editProduct);

// Delete route
router.delete('/delete', productController.deleteProduct);

// Status management routes
router.patch('/inactivate', productController.inactivateProduct);
router.patch('/activate', productController.activateProduct);

module.exports = router;