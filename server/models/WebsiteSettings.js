/**
 * models/WebsiteSettings.js
 *
 * Improvements:
 *  - Added email format validation regex
 *  - Added URL format validation for instagram/facebook fields
 */

const mongoose = require('mongoose');

const urlValidator = {
  validator: (v) => !v || /^https?:\/\/.+/.test(v),
  message  : 'Must be a valid URL starting with http:// or https://',
};

const WebsiteSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type   : String,
      default: 'AURA RESIN',
      trim   : true,
    },
    heroTitle: {
      type   : String,
      default: 'Handcrafted Resin Art That Makes Every Space Unique',
      trim   : true,
    },
    heroSubtitle: {
      type   : String,
      default: 'Discover the fusion of nature and artistry. Each piece is a unique story told in glass-like resin.',
      trim   : true,
    },
    logo: {
      url     : { type: String, default: null },
      publicId: { type: String, default: null },
    },
    about: {
      type   : String,
      default: 'At Aura Resin, we believe that art should be tactile. Our journey began with a fascination for the fluid beauty of resin—a material that captures motion and light in a permanent, glass-like embrace.',
      trim   : true,
    },
    whatsapp: {
      type   : String,
      default: '+1 (234) 567-890',
      trim   : true,
    },
    email: {
      type     : String,
      default  : 'hello@auraresin.art',
      lowercase: true,
      trim     : true,
      validate : {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message  : 'Must be a valid email address',
      },
    },
    instagram: {
      type    : String,
      default : null,
      trim    : true,
      validate: urlValidator,
    },
    facebook: {
      type    : String,
      default : null,
      trim    : true,
      validate: urlValidator,
    },
    address: {
      type   : String,
      default: '123 Artisan Way, Creative District',
      trim   : true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', WebsiteSettingsSchema);
