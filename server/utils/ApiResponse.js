/**
 * utils/ApiResponse.js
 *
 * Standardised JSON response helpers.
 *
 * Every API response shape:
 * {
 *   success   : boolean,
 *   message   : string,
 *   data      : any | null,
 *   pagination?: { total, page, limit, pages, hasNextPage, hasPrevPage },
 *   timestamp : string  ← ISO-8601 (added for production standard)
 * }
 */

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const body = {
    success  : true,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

const sendCreated = (res, data = null, message = 'Created successfully') =>
  sendSuccess(res, data, message, 201);

const sendPaginated = (res, data, pagination, message = 'Success') =>
  res.status(200).json({
    success   : true,
    message,
    data,
    pagination,
    timestamp : new Date().toISOString(),
  });

module.exports = { sendSuccess, sendCreated, sendPaginated };
