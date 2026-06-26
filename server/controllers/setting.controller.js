/**
 * controllers/setting.controller.js
 *
 * Singleton WebsiteSettings – always one document.
 *
 * Public:
 *   GET  /api/settings   – fetch settings (frontend populates hero, contact, footer)
 *
 * Protected (admin):
 *   PUT  /api/settings   – update settings + optional logo upload
 */

const WebsiteSettings = require('../models/WebsiteSettings');
const asyncHandler    = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { deleteImageByUrl } = require('../services/cloudinary.service');

// Helper: get-or-create the singleton document
const getOrCreate = async () => {
  let settings = await WebsiteSettings.findOne();
  if (!settings) {
    settings = await WebsiteSettings.create({});
  }
  return settings;
};

// ── GET /api/settings ─────────────────────────────────────
exports.getSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreate();
  sendSuccess(res, settings);
});

// ── PUT /api/settings ─────────────────────────────────────
exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();

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
    // Delete old logo from Cloudinary if exists
    if (settings.logo && settings.logo.url) {
      await deleteImageByUrl(settings.logo.url);
    }
    settings.logo = {
      url     : req.file.path,
      publicId: req.file.filename,
    };
  }

  await settings.save();
  sendSuccess(res, settings, 'Website settings updated successfully.');
});
