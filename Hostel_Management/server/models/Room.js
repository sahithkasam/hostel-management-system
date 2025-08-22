const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad'],
    required: true
  },
  amenities: [{
    type: String,
    enum: ['AC', 'WiFi', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Fan']
  }],
  monthlyRent: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  residents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

roomSchema.virtual('isAvailable').get(function() {
  return this.currentOccupancy < this.capacity;
});

roomSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.currentOccupancy;
});

module.exports = mongoose.model('Room', roomSchema);