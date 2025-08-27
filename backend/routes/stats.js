const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Client = require('../models/Client');

// simple in-memory cache (60s)
let cache = { data: null, ts: 0 };

const startEndOfToday = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

router.get('/landing', async (req, res) => {
    try {
        const now = Date.now();
        if (cache.data && now - cache.ts < 60_000) {
            return res.json(cache.data);
        }

        const { start, end } = startEndOfToday();

        // compute in parallel
        const [
            leadsManaged,
            clientsTotal,
            deliveredClients,
            todayFollowUps,
            todaysTasks,
            avgFollowAgg
        ] = await Promise.all([
            Lead.countDocuments({}), // or estimatedDocumentCount()
            Client.countDocuments({}),
            Client.countDocuments({ deliveryStatus: 'Delivered' }),
            Lead.countDocuments({
                followUpDate: { $gte: start, $lte: end },
                status: { $nin: ['Converted', 'Closed', 'Dead', 'Not Interested'] }
            }),
            Client.countDocuments({
                projectEndDate: { $gte: start, $lte: end },
                deliveryStatus: { $ne: 'Delivered' }
            }),
            Lead.aggregate([
                { $match: { followUpDate: { $ne: null }, date: { $ne: null } } },
                {
                    $project: {
                        diffHours: {
                            $divide: [{ $subtract: ['$followUpDate', '$date'] }, 1000 * 60 * 60]
                        }
                    }
                },
                { $match: { diffHours: { $gte: 0 } } },
                { $group: { _id: null, avgHours: { $avg: '$diffHours' } } }
            ])
        ]);

        const avgFollowUpHours = avgFollowAgg?.[0]?.avgHours || 0;
        const avgFollowUpLabel =
            avgFollowUpHours >= 24
                ? `~ ${Math.round(avgFollowUpHours / 24)}d`
                : avgFollowUpHours >= 1
                    ? `~ ${Math.round(avgFollowUpHours)}h`
                    : `~ ${Math.round(avgFollowUpHours * 60)}m`;

        const payload = {
            leadsManaged,
            clientsConverted: clientsTotal,      // use deliveredClients if you prefer only delivered
            deliveredClients,
            avgFollowUpHours,
            avgFollowUpLabel,
            todayFollowUps,
            todaysTasks,
            updatedAt: new Date().toISOString()
        };

        cache = { data: payload, ts: now };
        res.json(payload);
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;