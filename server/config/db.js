/**
 * config/db.js – MongoDB Atlas connection
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  const conn = await mongoose.connect(uri, {
    // Mongoose 7+ no longer needs these, but kept for clarity
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
