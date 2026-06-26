/**
 * routes/product.routes.js
 *
 * PUBLIC  (no auth):
 *   GET  /api/products                  – list (paginate / filter / sort)
 *   GET  /api/products/featured         – featured products for home page
 *   GET  /api/products/search           – full-text search  ?q=term
 *   GET  /api/products/category/:slug   – products by category slug
 *   GET  /api/products/stats            – dashboard counts
 *   GET  /api/products/:id              – single product + related
 *
 * PROTECTED (JWT):
 *   POST   /api/products                – create + images upload
 *   PUT    /api/products/:id            – update + optional images
 *   DELETE /api/products/:id            – delete + Cloudinary cleanup
 *
 * IMPORTANT: named routes MUST be declared BEFORE /:id to avoid
 *   Express treating "featured" / "search" as ObjectIds.
 */

const express = require('express');
const router  = express.Router();

const ctrl = require('../controllers/product.controller');
const { protect } = require('../middleware/auth');
const { handleProductImages } = require('../middleware/uploadHandler');
const {
  createProductValidator,
  updateProductValidator,
  searchQueryValidator,
} = require('../validators/product.validators');
const validate = require('../middleware/validate');

// ── Public named routes (order matters!) ─────────────────
router.get('/featured',           ctrl.getFeaturedProducts);
router.get('/search',             searchQueryValidator, validate, ctrl.searchProducts);
router.get('/stats',              protect, ctrl.getStats);
router.get('/category/:slug',     ctrl.getProductsByCategory);

// ── CRUD ─────────────────────────────────────────────────
router
  .route('/')
  .get(searchQueryValidator, validate, ctrl.getProducts)
  .post(protect, handleProductImages, createProductValidator, validate, ctrl.createProduct);

router
  .route('/:id')
  .get(ctrl.getProductById)
  .put(protect, handleProductImages, updateProductValidator, validate, ctrl.updateProduct)
  .delete(protect, ctrl.deleteProduct);

module.exports = router;
