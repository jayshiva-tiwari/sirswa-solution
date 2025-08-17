const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
console.log('Lead model type:', typeof Lead); // Add this
console.log('Lead model:', Lead); // Add this
const { authMiddleware } = require('../middleware/auth');


// ============ TEST ROUTES - YE SABSE UPAR LIKHO ============
// Test route to check if routes are working
router.get('/test', (req, res) => {
    res.json({ message: 'Leads route is working!', timestamp: new Date() });
});

// Test route without auth to check database connection
router.get('/noauth', async (req, res) => {
    try {
        const leads = await Lead.find().limit(10);
        res.json({ 
            message: 'Database connection working',
            count: leads.length, 
            leads 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: 'Database error',
            error: error.message 
        });
    }
});

// ============ ACTUAL ROUTES WITH AUTH - YE NEECHE HAIN ============


// Get all leads
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('GET /api/leads - userId:', req.userId); //debug
        const { status, source, startDate, endDate } = req.query;
        let filter = {};

        // Add filters if provided
        if (status) filter.status = status;
        if (source) filter.referenceSource = source;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const leads = await Lead.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        console.log('Found leads:', leads.length); // Debug log
        res.json(leads);
    } catch (error) {
        console.error('Error in GET /api/leads:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
});

// Create new lead
router.post('/', authMiddleware, async (req, res) => {
    try {

        console.log('POST /api/leads - userId:', req.userId); // Debug log
        console.log('Request body:', req.body); // Debug log

        const leadData = {
            ...req.body,
            createdBy: req.userId,
            assignedTo: req.userId
        };

        const lead = new Lead(leadData);
        await lead.save();

        const populatedLead = await Lead.findById(lead._id)
            .populate('createdBy', 'name email');

        res.status(201).json(populatedLead);
    } catch (error) {
         console.error('Error in POST /api/leads:', error); // Debug log
        res.status(400).json({ message: error.message });
    }
});

// Update lead
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate('createdBy', 'name email');

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete lead
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get leads with upcoming follow-ups
router.get('/followups', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leads = await Lead.find({
            followUpDate: { $gte: today },
            status: { $nin: ['Converted', 'Closed', 'Dead'] }
        })
            .populate('createdBy', 'name email')
            .sort({ followUpDate: 1 });

        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;