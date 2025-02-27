// routes/profile.routes.js
const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/personalInformation');

// Get profile page
router.get('/', profileController.getProfile);

// Update profile
router.post('/update', profileController.updateProfile);

// Uncomment and implement the upload photo route if needed
// router.post('/upload-photo', profileController.uploadProfilePhoto);

module.exports = router;