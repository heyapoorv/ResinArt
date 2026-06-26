/**
 * middleware/notFound.js
 *
 * Catches any request that doesn't match a registered route
 * and passes a structured 404 ApiError to the global handler.
 */

const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
