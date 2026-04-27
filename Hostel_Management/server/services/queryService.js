/**
 * queryService.js
 * Maps whitelisted AI intents to safe, parameterised MongoDB queries.
 *
 * Design principles:
 *  - NO raw query execution — every query is built using Mongoose models
 *    with explicit field selections and role-based scoping.
 *  - Students are ALWAYS scoped to their own userId; the scope is enforced
 *    here, not by the LLM.
 *  - Returns plain JS objects (never raw Mongoose documents) to avoid
 *    accidentally leaking internal fields like __v, passwords, etc.
 */

const Room       = require('../models/Room');
const Allocation = require('../models/Allocation');
const User       = require('../models/User');

/**
 * Entry point — dispatch to the appropriate query handler based on intent.
 *
 * @param {string} intent  - One of the ALLOWED_INTENTS
 * @param {Object} params  - LLM-extracted parameters (e.g. roomType, floor)
 * @param {Object} user    - Authenticated user from req.user
 * @returns {Promise<Object>} Safe, display-ready data object
 */
async function executeIntent(intent, params, user) {
  switch (intent) {
    case 'FIND_VACANT_ROOMS':
      return findVacantRooms(params, user);
    case 'VIEW_ALLOCATION':
      return viewAllocation(params, user);
    case 'PENDING_FEES':
      return pendingFees(params, user);
    case 'MAINTENANCE_REQUEST':
      return maintenanceGuidance();
    case 'GENERAL_INFO':
      return generalInfo();
    case 'UNKNOWN':
    default:
      return { message: 'Could not determine what information you need. Please rephrase your question.' };
  }
}

// ─── Intent Handlers ──────────────────────────────────────────────────────────

/**
 * FIND_VACANT_ROOMS — Admin only (students cannot list all rooms).
 * Optionally filters by roomType or floor extracted by the LLM.
 */
async function findVacantRooms(params, user) {
  // Students should not see hostel-wide room availability
  if (user.role !== 'admin') {
    return { message: 'You are not authorised to view hostel-wide room availability.' };
  }

  // Build a safe filter using only whitelisted params
  const filter = {
    isActive: true,
    // Virtual 'isAvailable' isn't queryable — use explicit field comparison
    $expr: { $lt: ['$currentOccupancy', '$capacity'] }
  };

  // Optionally narrow by roomType if the LLM extracted a valid one
  const validRoomTypes = ['single', 'double', 'triple', 'quad'];
  if (params.roomType && validRoomTypes.includes(params.roomType)) {
    filter.roomType = params.roomType;
  }

  // Optionally narrow by floor
  if (params.floor && !isNaN(Number(params.floor))) {
    filter.floor = Number(params.floor);
  }

  const rooms = await Room.find(filter)
    .select('roomNumber floor roomType capacity currentOccupancy monthlyRent amenities')
    .lean();

  return {
    totalVacant: rooms.length,
    rooms: rooms.map(r => ({
      roomNumber: r.roomNumber,
      floor: r.floor,
      type: r.roomType,
      availableSpots: r.capacity - r.currentOccupancy,
      monthlyRent: r.monthlyRent,
      amenities: r.amenities
    }))
  };
}

/**
 * VIEW_ALLOCATION — Shows room allocation.
 * Students are always scoped to their own record.
 * Admins can view any student's allocation (future: accept studentName param).
 */
async function viewAllocation(params, user) {
  let query;

  if (user.role === 'student') {
    // Hard-scope: student can ONLY see their own allocation
    query = Allocation.findOne({ student: user._id, status: 'active' });
  } else {
    // Admin: if a student name was mentioned, try to find them first
    if (params.studentName) {
      const targetStudent = await User.findOne({
        name: { $regex: new RegExp(params.studentName, 'i') },
        role: 'student'
      }).select('_id name').lean();

      if (!targetStudent) {
        return { message: `No student found with name matching "${params.studentName}".` };
      }
      query = Allocation.findOne({ student: targetStudent._id, status: 'active' });
    } else {
      // No specific student — return summary of all active allocations
      const count = await Allocation.countDocuments({ status: 'active' });
      return { totalActiveAllocations: count };
    }
  }

  const allocation = await query
    .populate('student', 'name email studentId')
    .populate('room', 'roomNumber floor roomType monthlyRent amenities')
    .lean();

  if (!allocation) {
    return { message: 'No active room allocation found.' };
  }

  // Return only display-safe fields — never internal ObjectIds
  return {
    student: {
      name: allocation.student?.name,
      email: allocation.student?.email,
      studentId: allocation.student?.studentId
    },
    room: {
      roomNumber: allocation.room?.roomNumber,
      floor: allocation.room?.floor,
      type: allocation.room?.roomType,
      amenities: allocation.room?.amenities,
      monthlyRent: allocation.room?.monthlyRent
    },
    startDate: allocation.startDate,
    status: allocation.status,
    notes: allocation.notes || null
  };
}

/**
 * PENDING_FEES — Approximates outstanding fees from active allocation.
 * Currently calculates based on months since allocation start.
 * Students are scoped to self; admins see hostel-wide summary.
 */
async function pendingFees(params, user) {
  if (user.role === 'student') {
    const allocation = await Allocation.findOne({ student: user._id, status: 'active' })
      .populate('room', 'monthlyRent roomNumber')
      .lean();

    if (!allocation) {
      return { message: 'No active allocation found. No fees are currently due.' };
    }

    const monthsElapsed = Math.ceil(
      (Date.now() - new Date(allocation.startDate)) / (1000 * 60 * 60 * 24 * 30)
    );

    return {
      roomNumber: allocation.room?.roomNumber,
      monthlyRent: allocation.monthlyRent,
      monthsElapsed,
      estimatedTotalDue: allocation.monthlyRent * monthsElapsed,
      note: 'This is an estimate. Contact admin for the exact outstanding amount.'
    };
  }

  // Admin: aggregate total rent across all active allocations
  const allocations = await Allocation.find({ status: 'active' })
    .select('monthlyRent startDate')
    .lean();

  const totalMonthlyRent = allocations.reduce((sum, a) => sum + (a.monthlyRent || 0), 0);

  return {
    totalActiveAllocations: allocations.length,
    totalMonthlyRentRoll: totalMonthlyRent,
    note: 'Aggregate across all active allocations.'
  };
}

/**
 * MAINTENANCE_REQUEST — No DB write from AI; provides guidance only.
 * AI will never create or update records — only route for self-service info.
 */
function maintenanceGuidance() {
  return {
    guidance: 'To raise a maintenance request, please contact the hostel warden at the front desk or email the admin. Provide your room number and a description of the issue.',
    note: 'The AI assistant cannot create maintenance requests directly. Please use the official channel.'
  };
}

/**
 * GENERAL_INFO — Placeholder for hostel policy / contact queries.
 * The LLM will handle the actual answer; we just pass context.
 */
function generalInfo() {
  return {
    hostName: 'Hostel Management System',
    supportEmail: 'admin@hostel.edu',
    wifiPolicy: 'WiFi is available 24/7 in all rooms.',
    visitingHours: '9 AM – 8 PM'
  };
}

module.exports = { executeIntent };
