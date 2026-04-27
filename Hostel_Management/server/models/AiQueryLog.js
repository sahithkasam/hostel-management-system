const mongoose = require('mongoose');

/**
 * AiQueryLog - Audit trail for every AI assistant interaction.
 * Stored immutably to support security review and compliance.
 */
const aiQueryLogSchema = new mongoose.Schema({
  // The authenticated user who sent the query
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Snapshot of the role at query time (role may change later)
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true
  },
  // Raw user message — stored for security auditing
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  // Structured intent resolved by the AI service
  detectedIntent: {
    type: String,
    required: true
  },
  // Final human-readable reply sent back to the user
  response: {
    type: String,
    required: true
  },
  // Whether the request was successfully fulfilled
  success: {
    type: Boolean,
    default: true
  },
  // Confidence score (0-1) from the AI model or rule-based system
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  // Source of the response (e.g., AI_MODEL, FAQ_RULE, SAFETY_GUARD)
  source: {
    type: String,
    maxlength: 50
  },
  // Parameters extracted from the user query for the detected intent
  params: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Flags for any detected security risks (e.g., PROMPT_INJECTION)
  safetyFlags: {
    type: [String],
    default: []
  }
}, {
  // createdAt gives us the exact audit timestamp
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('AiQueryLog', aiQueryLogSchema);
