const morgan = require('morgan');
const Logger = require('../../config/logger');
const { ENV } = require('../../config/vars');

const stream = {
  write: (message) => Logger.http(message),
};

const skip = () => {
  const env = ENV || 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;
