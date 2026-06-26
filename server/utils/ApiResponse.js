/**
 * utils/ApiResponse.js
 *
 * Standardised JSON response helpers to keep all responses consistent.
 *
 * Every API response has the shape:
 * {
 *   success : boolean,
 *   message : string,
 *   data    : any | null,
 *   pagination?: { ... }
 * }
 */

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

const sendCreated = (res, data = null, message = 'Created successfully') =>
  sendSuccess(res, data, message, 201);

const sendPaginated = (res, data, pagination, message = 'Success') =>
  res.status(200).json({ success: true, message, data, pagination });

module.exports = { sendSuccess, sendCreated, sendPaginated };
