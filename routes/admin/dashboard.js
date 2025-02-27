
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard');



router.get('/', dashboardController.getDashboard);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-chart', dashboardController.getSalesChartData);
router.get('/top-categories', dashboardController.getTopCategories);
router.post('/logout', dashboardController.logout);


module.exports = router;
