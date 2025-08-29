const mongoose = require('mongoose');

const todayTaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 140
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
        index: true
    },
    // The date/time this task is due today (e.g., 14:30)
    dueAt: {
        type: Date,
        required: true,
        index: true
    },
    // Normalized "today" (00:00) for easy querying
    taskDate: {
        type: Date,
        required: true,
        index: true
    },
    // TTL: Mongo will auto-delete when this time passes
    expireAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

// TTL index: document removed when expireAt passes
todayTaskSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TodayTask', todayTaskSchema);