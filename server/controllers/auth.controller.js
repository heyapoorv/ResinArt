/**
 * controllers/auth.controller.js
 *
 * POST /api/auth/login
 *   → Verifies credentials, returns JWT + admin profile
 *
 * GET /api/auth/me   (protected)
 *   → Returns current admin profile
 */

const Admin         = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const asyncHandler  = require('../utils/asyncHandler');
const ApiError      = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

// ── POST /api/auth/login ──────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch admin with passwordHash (field excluded by default)
  const admin = await Admin.findOne({ email }).select('+passwordHash');

  if (!admin || !(await admin.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(admin._id);

  sendSuccess(res, {
    token,
    admin: {
      id   : admin._id,
      email: admin.email,
    },
  }, 'Login successful.');
});

// ── GET /api/auth/me ─────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    admin: {
      id   : req.admin._id,
      email: req.admin.email,
    },
  });
});
