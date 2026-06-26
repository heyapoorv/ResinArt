/**
 * middleware/uploadHandler.js
 *
 * Wraps Multer upload calls in a promise so we can use
 * async/await + proper error forwarding in controllers.
 */

const { uploadProductImages, uploadLogo } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: handle multi-image product upload.
 * Field name expected: "images"  (up to 10 files)
 */
const handleProductImages = (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      return next(new ApiError(400, err.message || 'Image upload failed.'));
    }
    next();
  });
};

/**
 * Middleware: handle single logo upload.
 * Field name expected: "logo"
 */
const handleLogoUpload = (req, res, next) => {
  uploadLogo(req, res, (err) => {
    if (err) {
      return next(new ApiError(400, err.message || 'Logo upload failed.'));
    }
    next();
  });
};

module.exports = { handleProductImages, handleLogoUpload };
