/**
 * middleware/auth.js
 *
 * Protects admin-only routes.
 * Extracts JWT from the Authorization: Bearer <token> header,
 * verifies it, and attaches the admin document to req.admin.
 */

const jwt   = require('jsonwebtoken');
const Admin  = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorised – no token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorised – token is invalid or expired.');
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    throw new ApiError(401, 'Not authorised – admin account no longer exists.');
  }

  req.admin = admin;
  next();
});

module.exports = { protect };
