/**
 * controllers/setting.controller.js
 *
 * Improvements:
 *  - Uses in-memory settings cache (settings.service.js) to reduce DB calls
 *  - Adds Cache-Control header on GET (public settings can be browser-cached 5 min)
 *  - Invalidates cache after PUT
 */

const asyncHandler              = require('../utils/asyncHandler');
const { sendSuccess }           = require('../utils/ApiResponse');
const { deleteImageByUrl }      = require('../services/cloudinary.service');
const { getSettings, invalidateCache } = require('../services/settings.service');
const WebsiteSettings           = require('../models/WebsiteSettings');
const logger                    = require('../utils/logger');

// ── GET /api/settings ─────────────────────────────────────
exports.getSettings = asyncHandler(async (_req, res) => {
  const settings = await getSettings();

  // Allow browsers / CDN to cache public settings for 5 minutes
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

  sendSuccess(res, settings);
});

// ── PUT /api/settings ─────────────────────────────────────
exports.updateSettings = asyncHandler(async (req, res) => {
  // Always fetch live document for update (bypass read cache)
  let settings = await WebsiteSettings.findOne();
  if (!settings) {
    settings = await WebsiteSettings.create({});
  }

  const fields = [
    'businessName', 'heroTitle', 'heroSubtitle', 'about',
    'whatsapp', 'email', 'instagram', 'facebook', 'address',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  // Handle logo upload (single file via handleLogoUpload middleware)
  if (req.file) {
    // Delete old logo from Cloudinary if it exists
    if (settings.logo && settings.logo.url) {
      await deleteImageByUrl(settings.logo.url);
    }
    settings.logo = {
      url     : req.file.path,
      publicId: req.file.filename,
    };
    logger.info('Website logo updated', { publicId: req.file.filename });
  }

  await settings.save();

  // Invalidate in-memory cache so next read fetches fresh data
  invalidateCache();

  logger.info('WebsiteSettings updated');

  sendSuccess(res, settings, 'Website settings updated successfully.');
});
