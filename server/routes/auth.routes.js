/**
 * routes/auth.routes.js
 *
 * POST /api/auth/login  – public
 * GET  /api/auth/me     – protected
 */

const express = require('express');
const router  = express.Router();

const { login, getMe }    = require('../controllers/auth.controller');
const { protect }         = require('../middleware/auth');
const { loginValidator }  = require('../validators/auth.validators');
const validate            = require('../middleware/validate');

router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
