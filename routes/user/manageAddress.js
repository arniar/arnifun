// routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/user/manageAddress');

// Get all addresses for a user
router.get('/', addressController.getAllAddresses);

// Create Address
router.post('/addresses', addressController.createAddress);

// Update Address
router.put('/addresses/:id', addressController.updateAddress);

// Delete Address
router.delete('/addresses/:id', addressController.deleteAddress);

// Set Primary Address
router.patch('/addresses/:id/primary', addressController.setPrimaryAddress);

module.exports = router;