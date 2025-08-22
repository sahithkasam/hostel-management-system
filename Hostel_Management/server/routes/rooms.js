const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const { available, roomType, floor, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (available === 'true') {
      query.$expr = { $lt: ['$currentOccupancy', '$capacity'] };
    }
    if (roomType) query.roomType = roomType;
    if (floor) query.floor = parseInt(floor);

    const rooms = await Room.find(query)
      .populate('residents', 'name studentId email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ floor: 1, roomNumber: 1 });

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create room (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { roomNumber, floor, capacity, roomType, amenities, monthlyRent } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = new Room({
      roomNumber,
      floor,
      capacity,
      roomType,
      amenities,
      monthlyRent
    });

    await room.save();
    res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { roomNumber, floor, capacity, roomType, amenities, monthlyRent, isActive } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, floor, capacity, roomType, amenities, monthlyRent, isActive },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('residents', 'name studentId email phone');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;