const httpStatus = require('http-status');
const ExtendableError = require('./ExtendableError');

class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor({
    message = '',
    errors = null,
    stack = null,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    code = 'ERROR',
  }) {
    super({
      message,
      errors,
      status,
      isPublic,
      stack,
      code,
    });
  }
}

module.exports = APIError;
