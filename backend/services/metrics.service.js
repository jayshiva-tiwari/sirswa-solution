const Lead = require('../models/Lead');
const Client = require('../models/Client');

// --- Helper Functions ---
const getStartOfWeek = () => {
    const now = new Date();
    // Sunday as the first day of the week
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

const getStartOfMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
};

// This function calculates all performance metrics and returns a promise
const calculatePerformanceMetrics = async () => {
    try {
        const startOfWeek = getStartOfWeek();
        const startOfMonth = getStartOfMonth();

        // Run all queries in parallel for efficiency
        const [
            newLeadsThisWeek,
            dealsClosedThisMonth,
            pendingFollowUps,
            totalLeadsThisMonth,
            respondedLeadsThisMonth
        ] = await Promise.all([
            // 1. New Leads This Week
            Lead.countDocuments({ createdAt: { $gte: startOfWeek } }),
            // 2. Deals Closed This Month
            Lead.countDocuments({
                status: { $in: ['Converted', 'Closed'] },
                updatedAt: { $gte: startOfMonth }
            }),
            // 3. Pending Follow-ups (for today and future)
            Lead.countDocuments({
                followUpDate: { $gte: new Date() },
                status: { $nin: ['Converted', 'Closed', 'Dead'] }
            }),
            // 4. Total Leads This Month (for rate calculation)
            Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
            // 5. Responded Leads This Month (for rate calculation)
            Lead.countDocuments({
                createdAt: { $gte: startOfMonth },
                status: { $nin: ['New', 'Not Connected', 'Not Answered'] }
            })
        ]);

        // Calculate Response Rate
        const responseRate = totalLeadsThisMonth > 0
            ? Math.round((respondedLeadsThisMonth / totalLeadsThisMonth) * 100)
            : 0;

        // Return a clean object with the calculated metrics
        return {
            newLeadsThisWeek,
            dealsClosedThisMonth,
            pendingFollowUps,
            responseRate,
        };

    } catch (error) {
        console.error("Error in metrics service:", error);
        // Return default values in case of an error
        return {
            newLeadsThisWeek: 0,
            dealsClosedThisMonth: 0,
            pendingFollowUps: 0,
            responseRate: 0,
        };
    }
};

module.exports = {
    calculatePerformanceMetrics,
};