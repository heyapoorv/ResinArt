/**
 * middleware/validate.js
 *
 * Improvement: returns ALL validation errors in a consistent array,
 * not just the first one — better DX for the frontend.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field  : e.path || e.param,
      message: e.msg,
    }));
    throw new ApiError(422, 'Validation failed.', errors);
  }
  next();
};

module.exports = validate;
