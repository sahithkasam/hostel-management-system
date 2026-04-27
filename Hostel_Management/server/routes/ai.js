/**
 * routes/ai.js
 * POST /api/ai/chat — AI Hostel Assistant endpoint.
 *
 * Flow:
 *   1. Authenticate user via existing JWT middleware
 *   2. Validate & sanitise input
 *   3. Detect intent via Gemini (aiService)
 *   4. Whitelist check on detected intent
 *   5. Execute safe MongoDB query (queryService)
 *   6. Generate human-readable response (aiService)
 *   7. Write audit log (AiQueryLog)
 *   8. Return { reply, intent } to client
 */

const express    = require('express');
const { auth }   = require('../middleware/auth');
const aiService  = require('../services/aiService');
const queryService = require('../services/queryService');
const AiQueryLog = require('../models/AiQueryLog');

const router = express.Router();

// Rate limiter: simple in-memory counter per user (production: use redis + express-rate-limit)
const requestCounts = new Map();
const RATE_LIMIT    = 20;  // max requests per 15 minutes per user
const RATE_WINDOW   = 15 * 60 * 1000;

function checkRateLimit(userId) {
  const key    = userId.toString();
  const now    = Date.now();
  const record = requestCounts.get(key) || { count: 0, windowStart: now };

  if (now - record.windowStart > RATE_WINDOW) {
    // Reset window
    requestCounts.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;

  record.count += 1;
  requestCounts.set(key, record);
  return true;
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────

router.post('/chat', auth, async (req, res) => {
  const user = req.user;

  // ── Rate limiting ────────────────────────────────────────────────────────
  if (!checkRateLimit(user._id)) {
    return res.status(429).json({
      message: 'Too many AI requests. Please wait a few minutes and try again.'
    });
  }

  // ── Input validation ─────────────────────────────────────────────────────
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ message: 'Message is required.' });
  }
  if (message.trim().length > 500) {
    return res.status(400).json({ message: 'Message must be 500 characters or fewer.' });
  }

  let detectedIntent = 'UNKNOWN';
  let reply          = '';
  let success        = true;
  let confidence     = 0;
  let source         = 'AI_MODEL';
  let params         = {};
  let safetyFlags    = [];

  const safety = aiService.analyseSafety(message, user);
  safetyFlags = safety.flags;

  if (safety.blocked) {
    detectedIntent = 'UNKNOWN';
    reply = 'Your message appears to request restricted or unsafe information. Please ask a hostel-related question without bypass instructions.';
    source = 'SAFETY_GUARD';
    confidence = 1;
    success = false;

    AiQueryLog.create({
      userId: user._id,
      role: user.role,
      message: aiService.sanitiseInput(message),
      detectedIntent,
      response: reply,
      success,
      confidence,
      source,
      params,
      safetyFlags
    }).catch(err => console.error('[AI Route] Failed to write audit log:', err.message));

    return res.json({ reply, intent: detectedIntent, confidence, source, params, safetyFlags });
  }

  try {
    // ── Step 1: Detect intent via LLM ─────────────────────────────────
    const intentResult = await aiService.detectIntent(message, user);
    detectedIntent = intentResult.intent;
    confidence = intentResult.confidence ?? 0;
    source = intentResult.source || 'AI_MODEL';
    params = intentResult.params || {};

    // ── Step 2: Whitelist enforcement (defence-in-depth) ──────────────────
    // aiService already enforces the whitelist, but we double-check here
    if (!aiService.ALLOWED_INTENTS.has(detectedIntent)) {
      detectedIntent = 'UNKNOWN';
    }

    // ── Step 3: Execute safe MongoDB query ────────────────────────────────
    const dbData = await queryService.executeIntent(detectedIntent, params, user);

    // ── Step 4: Generate human-readable response ──────────────────────────
    reply = await aiService.generateResponse(detectedIntent, dbData, user);

  } catch (error) {
    console.error('[AI Route] Error processing chat request:', error.message);
    success = false;

    const faq = aiService.getFaqFallback(message);
    if (faq) {
      detectedIntent = faq.intent;
      reply = faq.reply;
      confidence = faq.confidence ?? 0.6;
      source = faq.source || 'FAQ_RULE';

      AiQueryLog.create({
        userId: user._id,
        role: user.role,
        message: aiService.sanitiseInput(message),
        detectedIntent,
        response: reply,
        success,
        confidence,
        source,
        params,
        safetyFlags
      }).catch(err => console.error('[AI Route] Failed to write audit log:', err.message));

      return res.json({ reply, intent: detectedIntent, confidence, source, params, safetyFlags });
    }

    if (error.code === 'AI_KEY_INVALID') {
      reply = 'The AI assistant is not configured correctly right now (invalid API key). Please contact admin and try again later.';
    } else if (error.code === 'AI_MODEL_UNAVAILABLE') {
      reply = 'The AI model configured for this assistant is unavailable right now. Please contact admin and try again later.';
    } else if (error.code === 'AI_QUOTA_OR_RATE_LIMIT') {
      reply = 'The AI assistant is currently rate-limited. Please wait a moment and try again.';
    } else {
      reply = 'Sorry, the AI assistant encountered an error. Please try again shortly.';
    }
  }

  // ── Step 5: Write audit log (non-blocking — never fail the request) ───
  AiQueryLog.create({
    userId: user._id,
    role: user.role,
    message: aiService.sanitiseInput(message),
    detectedIntent,
    response: reply,
    success,
    confidence,
    source,
    params,
    safetyFlags
  }).catch(err => console.error('[AI Route] Failed to write audit log:', err.message));

  return res.json({ reply, intent: detectedIntent, confidence, source, params, safetyFlags });
});

module.exports = router;
