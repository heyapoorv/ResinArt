/**
 * utils/ApiError.js
 *
 * Custom error class that carries an HTTP status code.
 * Used throughout controllers to signal meaningful errors.
 */

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors     = errors; // optional field-level validation errors
    this.isOperational = true; // flag to distinguish operational vs programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
