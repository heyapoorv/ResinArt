/**
 * config/cloudinary.js – Cloudinary SDK configuration
 *
 * Improvements:
 *  - Uses crypto.randomUUID() for public_id (collision-safe)
 *  - Eager transformation generates a 400x400 WebP thumbnail at upload time
 *    so product list pages can use a smaller variant without runtime transforms
 */

const cloudinaryPkg = require('cloudinary');
const cloudinary    = cloudinaryPkg.v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();

// Initialise Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key   : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure    : true,
});

const FOLDER = process.env.CLOUDINARY_FOLDER || 'aura_resin';

// ──────────────────────────────────────────────────────────
// Multer + Cloudinary storage – PRODUCT IMAGES (multiple)
// ──────────────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder         : `${FOLDER}/products`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation : [
      // Primary: limit max dimension to 1200px, auto-quality, auto-format (WebP/AVIF)
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    // Eager: generate a thumbnail variant at upload time to avoid runtime transforms
    eager: [
      { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto:eco', fetch_format: 'auto' },
    ],
    eager_async: true, // don't block the upload response
    public_id   : `product_${crypto.randomUUID()}`, // UUID avoids collision
  }),
});

// Multer + Cloudinary storage – SETTINGS (logo, single image)
const settingsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder         : `${FOLDER}/settings`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation : [
      { width: 400, height: 400, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    public_id: `logo_${crypto.randomUUID()}`,
  }),
});

// ──────────────────────────────────────────────────────────
// File MIME type validation
// ──────────────────────────────────────────────────────────
const imageFileFilter = (_req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|webp|avif)$/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, avif).'));
  }
};

// ──────────────────────────────────────────────────────────
// Multer upload instances
// ──────────────────────────────────────────────────────────
const uploadProductImages = multer({
  storage   : productStorage,
  limits    : { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: imageFileFilter,
}).array('images', 10); // up to 10 images per product

const uploadLogo = multer({
  storage   : settingsStorage,
  limits    : { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFileFilter,
}).single('logo');

// ──────────────────────────────────────────────────────────
// Helper – delete a single image from Cloudinary by public_id
// ──────────────────────────────────────────────────────────
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Extract public_id from a full Cloudinary URL.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/aura_resin/products/xyz.webp
 *      → "aura_resin/products/xyz"
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Skip version segment (v1234567890)
  const relevantParts = parts.slice(uploadIndex + 2);
  const lastPart = relevantParts[relevantParts.length - 1];
  relevantParts[relevantParts.length - 1] = lastPart.split('.')[0]; // strip extension
  return relevantParts.join('/');
};

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadLogo,
  deleteCloudinaryImage,
  getPublicIdFromUrl,
};
