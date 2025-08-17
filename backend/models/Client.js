const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  projectDetails: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  advanceReceived: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  bondSigned: {
    type: Boolean,
    default: false
  },
  projectStartDate: {
    type: Date,
    required: true
  },
  projectEndDate: {
    type: Date,
    required: true
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Delivered'],
    default: 'Pending'
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    description: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  createdBy: {
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

// Calculate remaining amount before saving
clientSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.advanceReceived;
  this.updatedAt = Date.now();
  next();
});

// Update remaining amount on update
clientSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.totalAmount !== undefined || update.advanceReceived !== undefined) {
    const totalAmount = update.totalAmount || 0;
    const advanceReceived = update.advanceReceived || 0;
    update.remainingAmount = totalAmount - advanceReceived;
  }
  update.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);