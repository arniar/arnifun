const express = require('express');
const router = express.Router();
const salesController = require('../../controllers/admin/sales');



// Render sales report page
router.get('/', salesController.renderSalesReport);

// Get sales report data
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const salesData = await salesController.getProductSales({ startDate, endDate });
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
});

// Download sales report
router.get('/download', salesController.downloadReport);

// Get period-specific reports
router.get('/daily', async (req, res) => {
    try {
        const today = new Date();
        const salesData = await salesController.getProductSales({
            startDate: today.toISOString(),
            endDate: today.toISOString()
        });
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching daily report:', error);
        res.status(500).json({ error: 'Failed to fetch daily report' });
    }
});

router.get('/monthly', async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const salesData = await salesController.getProductSales({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Failed to fetch monthly report' });
    }
});

router.get('/yearly', async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), 0, 1);
        const endDate = new Date(today.getFullYear(), 11, 31);
        
        const salesData = await salesController.getProductSales({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching yearly report:', error);
        res.status(500).json({ error: 'Failed to fetch yearly report' });
    }
});

// Custom period report
router.get('/custom', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const salesData = await salesController.getProductSales({ startDate, endDate });
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching custom period report:', error);
        res.status(500).json({ error: 'Failed to fetch custom period report' });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Sales routes error:', err);
    res.status(500).json({ 
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;