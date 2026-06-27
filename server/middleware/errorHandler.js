/**
 * middleware/errorHandler.js
 *
 * Global error handling middleware.
 * Must be the LAST middleware registered in app.js.
 *
 * Improvements:
 *  - Uses Winston logger instead of console.error
 *  - Includes request ID in error logs for tracing
 *  - Adds timestamp to error responses
 */

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger   = require('../utils/logger');

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
  if (err.code === 'LIMIT_FILE_SIZE')       { statusCode = 400; message = 'File size exceeds the 10 MB limit.'; }
  if (err.code === 'LIMIT_FILE_COUNT')      { statusCode = 400; message = 'Too many files uploaded.'; }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') { statusCode = 400; message = 'Unexpected file field.'; }

  // ── Log errors ────────────────────────────────────────
  const logContext = {
    requestId : req.id,
    method    : req.method,
    url       : req.originalUrl,
    statusCode,
    ip        : req.ip,
  };

  if (statusCode >= 500) {
    logger.error(message, { ...logContext, stack: err.stack });
  } else if (statusCode >= 400) {
    logger.warn(message, logContext);
  }

  // ── Development: expose stack trace ───────────────────
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success  : false,
      message,
      errors,
      stack    : err.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Production: hide implementation details ────────────
  if (!err.isOperational) {
    statusCode = 500;
    message    = 'Something went wrong. Please try again later.';
    errors     = [];
  }

  res.status(statusCode).json({
    success  : false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
