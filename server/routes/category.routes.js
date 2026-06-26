/**
 * routes/category.routes.js
 *
 * PUBLIC:
 *   GET  /api/categories        – list all with product counts
 *   GET  /api/categories/:id    – single category
 *
 * PROTECTED:
 *   POST   /api/categories      – create
 *   PUT    /api/categories/:id  – update
 *   DELETE /api/categories/:id  – delete (safe: rejects if products linked)
 */

const express = require('express');
const router  = express.Router();

const ctrl     = require('../controllers/category.controller');
const { protect } = require('../middleware/auth');
const { categoryValidator } = require('../validators/category.validators');
const validate = require('../middleware/validate');

router
  .route('/')
  .get(ctrl.getCategories)
  .post(protect, categoryValidator, validate, ctrl.createCategory);

router
  .route('/:id')
  .get(ctrl.getCategoryById)
  .put(protect, categoryValidator, validate, ctrl.updateCategory)
  .delete(protect, ctrl.deleteCategory);

module.exports = router;
