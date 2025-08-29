// routes/tasks.js
const express = require('express');
const router = express.Router();
const TodayTask = require('../models/TodayTask');
const { authMiddleware } = require('../middleware/auth');

// Helper: IST today's start/end and dueAt in IST
const toIST = (d = new Date()) => new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
const getISTStartEndOfToday = () => {
    const nowIST = toIST();
    const start = new Date(nowIST); start.setHours(0, 0, 0, 0);
    const end = new Date(nowIST); end.setHours(23, 59, 59, 999);
    return { start, end };
};
const buildDueAtIST = (hhmm) => {
    const { start } = getISTStartEndOfToday();
    const [h, m] = (hhmm || '09:00').split(':').map(Number);
    const due = new Date(start); due.setHours(h || 0, m || 0, 0, 0);
    return due;
};

// GET /api/tasks/today?status=pending|completed|all
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const { start, end } = getISTStartEndOfToday();
        const status = req.query.status || 'pending';
        const query = {
            user: req.userId,
            taskDate: { $gte: start, $lte: end }
        };
        if (status !== 'all') query.status = status;

        const tasks = await TodayTask.find(query)
            .sort({ dueAt: 1, createdAt: 1 });

        const counts = {
            pending: await TodayTask.countDocuments({ user: req.userId, taskDate: { $gte: start, $lte: end }, status: 'pending' }),
            completed: await TodayTask.countDocuments({ user: req.userId, taskDate: { $gte: start, $lte: end }, status: 'completed' })
        };

        res.json({ tasks, counts });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/tasks  body: { title, time:'HH:mm', priority:'low|medium|high' }
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, time, priority } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const { start, end } = getISTStartEndOfToday();
        const dueAt = buildDueAtIST(time);

        const task = await TodayTask.create({
            user: req.userId,
            title,
            priority: priority || 'medium',
            status: 'pending',
            dueAt,
            taskDate: start,   // normalized today
            expireAt: end      // TTL: auto delete after midnight IST
        });
        // debugger
        // console.log('task created', task)
        

        res.status(201).json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// PATCH /api/tasks/:id/toggle  -> toggle pending/completed
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
    try {
        const task = await TodayTask.findOne({ _id: req.params.id, user: req.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        task.status = newStatus;
        task.completedAt = newStatus === 'completed' ? new Date() : null;
        await task.save();

        res.json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const del = await TodayTask.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!del) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// DELETE /api/tasks/today/clear-completed
router.delete('/today/clear-completed', authMiddleware, async (req, res) => {
    try {
        const { start, end } = getISTStartEndOfToday();
        const result = await TodayTask.deleteMany({
            user: req.userId,
            taskDate: { $gte: start, $lte: end },
            status: 'completed'
        });
        res.json({ message: 'Cleared', deleted: result.deletedCount });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;