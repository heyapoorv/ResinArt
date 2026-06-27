/**
 * config/env.js – Environment variable validation & typed config
 *
 * Validates all required env vars at startup.
 * Throws descriptive errors if anything is missing so the app
 * never silently starts in a broken state.
 *
 * Usage: require this file BEFORE any other module that needs env vars.
 */

require('dotenv').config();

const REQUIRED = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\n❌  FATAL: Missing required environment variables:\n   ${missing.join('\n   ')}\n`);
  console.error('   Copy .env.example to .env and fill in the values.\n');
  process.exit(1);
}

// Warn about insecure defaults in production
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌  FATAL: JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
}

module.exports = {
  NODE_ENV   : process.env.NODE_ENV || 'development',
  PORT       : parseInt(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT: {
    SECRET    : process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY   : process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FOLDER    : process.env.CLOUDINARY_FOLDER || 'aura_resin',
  },
  CORS: {
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    MAX      : parseInt(process.env.RATE_LIMIT_MAX)       || 100,
  },
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};
