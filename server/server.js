/**
 * server.js – Entry point
 *
 * Improvements:
 *  - Env validation runs first (fail-fast)
 *  - Graceful shutdown on SIGTERM + SIGINT
 *  - uncaughtException handler to prevent silent crashes
 *  - Structured startup log via Winston
 */

// ── Validate env vars before anything else ────────────────
require('./config/env');

const app        = require('./app');
const connectDB  = require('./config/db');
const logger     = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// ── Crash guard: uncaught synchronous errors ──────────────
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 💥 – shutting down', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// ── Connect to MongoDB, then start HTTP server ────────────
let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`🚀  Aura Resin API started`, {
        port       : PORT,
        environment: process.env.NODE_ENV,
        health     : `http://localhost:${PORT}/api/health`,
        ready      : `http://localhost:${PORT}/api/ready`,
      });
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB – server not started.', { error: err.message });
    process.exit(1);
  });

// ── Graceful shutdown ─────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received – shutting down gracefully…`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await require('mongoose').disconnect();
        logger.info('MongoDB connection closed.');
      } catch (_) {
        // ignore disconnect errors on shutdown
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION 💥', { reason: String(reason) });
  // Let the process shut down after draining the event loop
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
