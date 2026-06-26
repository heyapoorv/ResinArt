/**
 * services/cloudinary.service.js
 *
 * Encapsulates all Cloudinary operations so controllers stay thin.
 */

const {
  cloudinary,
  deleteCloudinaryImage,
  getPublicIdFromUrl,
} = require('../config/cloudinary');

/**
 * Delete multiple images from Cloudinary by their publicIds.
 * @param {Array<{publicId: string}>} images
 */
const deleteImages = async (images = []) => {
  const promises = images
    .filter((img) => img && img.publicId)
    .map((img) => deleteCloudinaryImage(img.publicId));
  return Promise.allSettled(promises);
};

/**
 * Delete a single image given its full Cloudinary URL.
 * Extracts the publicId automatically.
 */
const deleteImageByUrl = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return null;
  return deleteCloudinaryImage(publicId);
};

/**
 * Transform multer-uploaded files array into our image sub-document format.
 * Works with both cloudinary storage (file.path = url, file.filename = publicId)
 * and the v2 cloudinary SDK (file.secure_url, file.public_id).
 */
const filesToImageDocs = (files = []) =>
  files.map((file) => ({
    url     : file.path || file.secure_url,
    publicId: file.filename || file.public_id,
    alt     : file.originalname || '',
  }));

module.exports = { deleteImages, deleteImageByUrl, filesToImageDocs };
