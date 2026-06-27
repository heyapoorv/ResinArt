/**
 * app.js – Express application factory
 *
 * Improvements:
 *  - Response compression (gzip/brotli)
 *  - Auth-specific rate limiter (stricter)
 *  - express-slow-down on auth routes (brute-force mitigation)
 *  - X-Request-Id header for request tracing
 *  - Winston request logging via Morgan stream
 *  - /api/ready readiness probe (checks DB connection)
 *  - Enhanced /api/health with DB status + uptime
 *  - xss-clean wired in (was in deps but not used)
 */

// ── Env validated upstream in server.js ──────────────────
const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const compression    = require('compression');
const mongoSanitize  = require('express-mongo-sanitize');
const rateLimit      = require('express-rate-limit');
const slowDown       = require('express-slow-down');
const xssClean       = require('xss-clean');
const { v4: uuidv4 } = require('uuid');

const logger       = require('./utils/logger');
const { isConnected } = require('./config/db');
const env          = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const notFound     = require('./middleware/notFound');

// Route imports
const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const settingRoutes  = require('./routes/setting.routes');

const app = express();

// ──────────────────────────────────────────────────────────
// REQUEST ID – attach unique ID for tracing
// ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ──────────────────────────────────────────────────────────
// COMPRESSION – gzip / brotli (before any response-producing middleware)
// ──────────────────────────────────────────────────────────
app.use(compression());

// ──────────────────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ──────────────────────────────────────────────────────────
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.CORS.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow origin: ${origin}`));
    }
  },
  credentials: true,
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs      : env.RATE_LIMIT.WINDOW_MS,
  max           : env.RATE_LIMIT.MAX,
  standardHeaders: true,
  legacyHeaders  : false,
  keyGenerator   : (req) => req.ip,
  message        : { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Strict auth rate limiter – 10 attempts per 15 min
const authLimiter = rateLimit({
  windowMs      : 15 * 60 * 1000,
  max           : 10,
  standardHeaders: true,
  legacyHeaders  : false,
  message        : { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Slow-down: after 5 login attempts, add 500ms delay per request
const authSlowDown = slowDown({
  windowMs       : 15 * 60 * 1000,
  delayAfter     : 5,
  delayMs        : () => 500,
});

app.use('/api/auth/login', authSlowDown, authLimiter);

// ──────────────────────────────────────────────────────────
// GENERAL MIDDLEWARE
// ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());  // prevent MongoDB operator injection
app.use(xssClean());       // sanitize user input against XSS

// HTTP request logger (piped to Winston)
app.use(morgan(
  env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream: logger.stream }
));

// ──────────────────────────────────────────────────────────
// HEALTH & READINESS PROBES
// ──────────────────────────────────────────────────────────

/** /api/health – liveness probe (always 200 if process is running) */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success    : true,
    message    : 'Aura Resin API is healthy 🌟',
    timestamp  : new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime     : Math.floor(process.uptime()),
    db         : isConnected() ? 'connected' : 'disconnected',
  });
});

/** /api/ready – readiness probe (503 if DB not ready) */
app.get('/api/ready', (_req, res) => {
  const dbOk = isConnected();
  res.status(dbOk ? 200 : 503).json({
    success  : dbOk,
    ready    : dbOk,
    timestamp: new Date().toISOString(),
    db       : dbOk ? 'connected' : 'disconnected',
  });
});

// ──────────────────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings',   settingRoutes);

// ──────────────────────────────────────────────────────────
// ERROR HANDLING
// ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
