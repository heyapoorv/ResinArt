/**
 * middleware/errorHandler.js
 *
 * Global error handling middleware.
 * Must be the LAST middleware registered in app.js.
 *
 * Handles:
 *  - ApiError (operational errors) → structured response
 *  - Mongoose ValidationError     → 400 with field details
 *  - Mongoose CastError           → 400 (invalid ObjectId)
 *  - Mongoose Duplicate Key       → 409 Conflict
 *  - JWT errors                   → 401
 *  - Multer errors                → 400
 *  - Generic 500 fallback
 */

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = err.errors     || [];

  // ── Mongoose ValidationError ──────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = 'Validation failed.';
    errors     = Object.values(err.errors).map((e) => ({
      field  : e.path,
      message: e.message,
    }));
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid value for field: ${err.path}`;
  }

  // ── Mongoose Duplicate Key ────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message    = `Duplicate value: ${field} already exists.`;
  }

  // ── JWT Errors ────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token has expired.'; }

  // ── Multer Errors ─────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE')    { statusCode = 400; message = 'File size exceeds the 10 MB limit.'; }
  if (err.code === 'LIMIT_FILE_COUNT')   { statusCode = 400; message = 'Too many files uploaded.'; }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') { statusCode = 400; message = 'Unexpected file field.'; }

  // ── Development vs Production ─────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ [ERROR]', err);
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack,
    });
  }

  // In production, hide stack traces and internal errors
  if (!err.isOperational) {
    statusCode = 500;
    message    = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json({ success: false, message, errors });
};

module.exports = errorHandler;
