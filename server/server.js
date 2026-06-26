/**
 * server.js – Entry point
 * Starts the HTTP server after establishing the DB connection.
 */

const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀  Aura Resin API running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`   Health : http://localhost:${PORT}/api/health\n`);
  });
}).catch((err) => {
  console.error('❌  Failed to connect to MongoDB. Server not started.', err);
  process.exit(1);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥', err.message);
  process.exit(1);
});
