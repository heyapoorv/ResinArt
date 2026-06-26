/**
 * models/WebsiteSettings.js
 *
 * Singleton document – there is always exactly one record.
 * Fields match the contact / footer / hero sections across all pages:
 *   - businessName  → "AURA RESIN" branding
 *   - heroTitle     → home page hero H1
 *   - heroSubtitle  → home page hero paragraph
 *   - logo          → stored as Cloudinary URL
 *   - about         → about section body text
 *   - whatsapp      → "+1 (234) 567-890" floating button & contact section
 *   - email         → "hello@auraresin.art" contact section
 *   - instagram     → footer social links
 *   - facebook      → footer social links
 *   - address       → "123 Artisan Way, Creative District"
 */

const mongoose = require('mongoose');

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
      type   : String,
      default: 'hello@auraresin.art',
      lowercase: true,
      trim   : true,
    },
    instagram: {
      type   : String,
      default: null,
      trim   : true,
    },
    facebook: {
      type   : String,
      default: null,
      trim   : true,
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
