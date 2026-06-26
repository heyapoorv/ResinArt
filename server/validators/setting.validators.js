/**
 * validators/setting.validators.js
 *
 * Validates fields for the WebsiteSettings update endpoint.
 * Matches all content editable from the admin Settings page.
 */

const { body } = require('express-validator');

const settingValidator = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Business name cannot exceed 100 characters.'),

  body('heroTitle')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Hero title cannot exceed 300 characters.'),

  body('heroSubtitle')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Hero subtitle cannot exceed 500 characters.'),

  body('about')
    .optional()
    .trim(),

  body('whatsapp')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('WhatsApp number cannot exceed 30 characters.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('instagram')
    .optional()
    .trim()
    .isURL().withMessage('Instagram must be a valid URL.'),

  body('facebook')
    .optional()
    .trim()
    .isURL().withMessage('Facebook must be a valid URL.'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters.'),
];

module.exports = { settingValidator };
