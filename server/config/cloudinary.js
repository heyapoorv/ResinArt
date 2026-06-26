/**
 * config/cloudinary.js – Cloudinary SDK configuration
 * Uses Cloudinary v1 (compatible with multer-storage-cloudinary v4)
 */

const cloudinaryPkg = require('cloudinary');
const cloudinary    = cloudinaryPkg.v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Initialise Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key   : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure    : true,
});

// ──────────────────────────────────────────────────────────
// Multer + Cloudinary storage – PRODUCT IMAGES (multiple)
// ──────────────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder        : `${process.env.CLOUDINARY_FOLDER || 'aura_resin'}/products`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    public_id: `product_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
  }),
});

// Multer + Cloudinary storage – SETTINGS (logo, single image)
const settingsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder        : `${process.env.CLOUDINARY_FOLDER || 'aura_resin'}/settings`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    public_id: `logo_${Date.now()}`,
  }),
});

// ──────────────────────────────────────────────────────────
// Multer upload instances
// ──────────────────────────────────────────────────────────
const uploadProductImages = multer({
  storage: productStorage,
  limits : { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, avif).'));
    }
  },
}).array('images', 10); // up to 10 images per product

const uploadLogo = multer({
  storage: settingsStorage,
  limits : { fileSize: 5 * 1024 * 1024 }, // 5 MB
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
  // skip version segment (v1234567890)
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
