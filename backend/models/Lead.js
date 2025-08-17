const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    referenceSource: {
        type: String,
        enum: ['Justdial', 'Adkriti', 'Meta', 'Google', 'Reference', 'Walk-in', 'Other'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['New', 'Interested', 'Not Connected', 'Not Answered', 'Converted', 'Visited', 'In Progress', 'Closed', 'Not Interested', 'Dead'],
        default: 'New'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    followUpDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
leadSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});


const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;