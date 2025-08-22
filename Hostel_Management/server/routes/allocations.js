const express = require('express');
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all allocations (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;

    const allocations = await Allocation.find(query)
      .populate('student', 'name studentId email')
      .populate('room', 'roomNumber floor roomType')
      .populate('allocatedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Allocation.countDocuments(query);

    res.json({
      allocations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create allocation (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { studentId, roomId, startDate, monthlyRent, notes } = req.body;

    const student = await User.findById(studentId);
    const room = await Room.findById(roomId);

    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    if (!room || !room.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive room' });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }

    if (student.roomAllocation) {
      return res.status(400).json({ message: 'Student already has a room allocation' });
    }

    const allocation = new Allocation({
      student: studentId,
      room: roomId,
      allocatedBy: req.user._id,
      startDate,
      monthlyRent,
      notes
    });

    await allocation.save();

    // Update room occupancy and residents
    room.currentOccupancy += 1;
    room.residents.push(studentId);
    await room.save();

    // Update student's room allocation
    student.roomAllocation = roomId;
    await student.save();

    await allocation.populate([
      { path: 'student', select: 'name studentId email' },
      { path: 'room', select: 'roomNumber floor roomType' },
      { path: 'allocatedBy', select: 'name' }
    ]);

    res.status(201).json({ message: 'Room allocated successfully', allocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update allocation status (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, endDate, notes } = req.body;

    const allocation = await Allocation.findById(req.params.id)
      .populate('student')
      .populate('room');

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    if (status === 'vacated' && allocation.status === 'active') {
      // Update room occupancy
      allocation.room.currentOccupancy -= 1;
      allocation.room.residents = allocation.room.residents.filter(
        resident => resident.toString() !== allocation.student._id.toString()
      );
      await allocation.room.save();

      // Clear student's room allocation
      allocation.student.roomAllocation = null;
      await allocation.student.save();
    }

    allocation.status = status;
    if (endDate) allocation.endDate = endDate;
    if (notes) allocation.notes = notes;

    await allocation.save();

    res.json({ message: 'Allocation updated successfully', allocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's allocation
router.get('/my-allocation', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allocation = await Allocation.findOne({ 
      student: req.user._id, 
      status: 'active' 
    })
      .populate('room', 'roomNumber floor roomType amenities monthlyRent residents')
      .populate('allocatedBy', 'name');

    if (!allocation) {
      return res.status(404).json({ message: 'No active allocation found' });
    }

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;