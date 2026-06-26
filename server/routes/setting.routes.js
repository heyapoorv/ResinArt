/**
 * routes/setting.routes.js
 *
 * PUBLIC:
 *   GET  /api/settings   – frontend fetches brand info, hero text, contact details
 *
 * PROTECTED:
 *   PUT  /api/settings   – admin updates settings + optional logo upload
 */

const express = require('express');
const router  = express.Router();

const ctrl     = require('../controllers/setting.controller');
const { protect } = require('../middleware/auth');
const { handleLogoUpload } = require('../middleware/uploadHandler');
const { settingValidator }  = require('../validators/setting.validators');
const validate = require('../middleware/validate');

router
  .route('/')
  .get(ctrl.getSettings)
  .put(protect, handleLogoUpload, settingValidator, validate, ctrl.updateSettings);

module.exports = router;
