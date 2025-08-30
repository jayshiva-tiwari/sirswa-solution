const express = require('express');
const router = express.Router();
const { calculatePerformanceMetrics } = require('../services/metrics.service');
const { authMiddleware } = require('../middleware/auth');

// GET /api/metrics/performance
router.get('/performance', authMiddleware, async (req, res) => {
    try {
        const metrics = await calculatePerformanceMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
});

module.exports = router;