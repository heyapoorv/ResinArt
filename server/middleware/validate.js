/**
 * middleware/validate.js
 *
 * Reads the result of express-validator checks and returns
 * a 422 Unprocessable Entity response if any errors exist.
 *
 * Usage:
 *   router.post('/route', [...validators], validate, controller);
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field  : e.path || e.param,
    message: e.msg,
  }));

  throw new ApiError(422, 'Validation failed.', errors);
};

module.exports = validate;
