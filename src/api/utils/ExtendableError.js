/**
 * @extends Error
 */

class ExtendableError extends Error {
  constructor({ message, errors, status, isPublic, stack, code }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.success = false;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
    this.success = false;
    this.code = code;
  }
}

module.exports = ExtendableError;
