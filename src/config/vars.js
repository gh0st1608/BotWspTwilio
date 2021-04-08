const path = require('path');
const dotenv = require('dotenv-safe');

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

const vars = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  LOGS: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  FIREBASE: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTHDOMAIN: process.env.FIREBASE_AUTHDOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGE_SENDER_ID: process.env.FIREBASE_MESSAGE_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
  },
  TWILIO: {
    ACCOUNT_SID_TWILIO: process.env.TWILIO_ACCOUNT_SID,
    AUTH_TOKEN_TWILIO: process.env.TWILIO_AUTH_TOKEN,
    FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
  },
  AWS_ENV: {
    S3_KEY_ID: process.env.AWS_S3_KEY_ID,
    S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
    S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  },
};

module.exports = vars;
