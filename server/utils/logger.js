/**
 * utils/logger.js – Winston structured logger
 *
 * Development : colorized, human-readable output
 * Production  : JSON format with timestamps (machine-parseable)
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started');
 *   logger.error('Something failed', { error: err.message });
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { NODE_ENV, LOG_LEVEL } = require('../config/env');

const { combine, timestamp, printf, colorize, errors, json } = format;

// ── Custom console format for development ────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${extras}${stack ? `\n${stack}` : ''}`;
  })
);

// ── JSON format for production (structured logging) ──────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: LOG_LEVEL,
  format: NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
  ],
});

// In production, also write errors to a file
if (NODE_ENV === 'production') {
  const logsDir = path.join(__dirname, '../logs');
  logger.add(new transports.File({
    filename : path.join(logsDir, 'error.log'),
    level    : 'error',
    maxsize  : 10 * 1024 * 1024, // 10 MB
    maxFiles : 5,
    tailable : true,
  }));
}

// Morgan-compatible HTTP stream
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
