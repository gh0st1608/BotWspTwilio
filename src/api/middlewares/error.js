const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { ENV } = require('../../config/vars');
const logger = require('../../config/logger');
/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  const response = {
    success: err.success,
    status: err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    stack: err.stack,
    code: err.code,
  };

  if (ENV !== 'development') {
    delete response.stack;
  }
  res.status(err.status || 500);
  res.json(response);
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
const converter = (err, req, res, next) => {
  let convertedError = err;
  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
      code: err.code,
    });
  }
  logger.debug(convertedError);
  return handler(convertedError, req, res, next);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res, next);
};

module.exports = {
  notFound,
  handler,
  converter,
};
