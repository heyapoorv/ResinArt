/**
 * config/db.js – MongoDB Atlas connection
 *
 * Improvements:
 *  - Connection pool (maxPoolSize: 10)
 *  - Reconnect event logging
 *  - Exported isConnected() helper for health/readiness probes
 */

const mongoose = require('mongoose');
const logger   = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  const conn = await mongoose.connect(uri, {
    maxPoolSize             : 10,   // connection pool – handle concurrent requests
    serverSelectionTimeoutMS: 5000, // fail fast if Atlas unreachable
    socketTimeoutMS         : 45000,
  });

  logger.info(`MongoDB connected: ${conn.connection.host}`);

  // Log reconnect events
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected. Attempting to reconnect…'));
  mongoose.connection.on('reconnected',  () => logger.info('MongoDB reconnected.'));
  mongoose.connection.on('error',        (err) => logger.error('MongoDB connection error', { error: err.message }));

  return conn;
};

/**
 * Returns true when Mongoose has an active connection.
 * Used by the /api/ready readiness probe.
 */
const isConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isConnected = isConnected;
