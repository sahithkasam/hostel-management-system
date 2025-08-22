const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allocatedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'vacated', 'suspended'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Allocation', allocationSchema);