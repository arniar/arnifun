const express = require('express');
const router = express.Router();
const variantController = require('../../controllers/admin/variant');

router.get('/',variantController.getVariant);
router.get('/variants', variantController.getVariants);
router.post('/', variantController.createVariant);
router.patch('/:id', variantController.updateVariant);
router.delete('/:id', variantController.deleteVariant);

module.exports = router;