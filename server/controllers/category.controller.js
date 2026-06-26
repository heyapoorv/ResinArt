/**
 * controllers/category.controller.js
 *
 * Public:
 *   GET  /api/categories            – all categories
 *   GET  /api/categories/:id        – single category
 *
 * Protected (admin):
 *   POST   /api/categories          – create
 *   PUT    /api/categories/:id      – update
 *   DELETE /api/categories/:id      – delete (only if no products reference it)
 */

const Category     = require('../models/Category');
const Product      = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../utils/ApiResponse');

// ── GET /api/categories ───────────────────────────────────
exports.getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  // Attach product count to each category
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id });
      return { ...cat.toObject(), productCount: count };
    })
  );

  sendSuccess(res, withCounts);
});

// ── GET /api/categories/:id ───────────────────────────────
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  sendSuccess(res, category);
});

// ── POST /api/categories ──────────────────────────────────
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description } = req.body;
  const category = await Category.create({ name, icon, description });
  sendCreated(res, category, 'Category created successfully.');
});

// ── PUT /api/categories/:id ───────────────────────────────
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');

  const { name, icon, description } = req.body;
  if (name        !== undefined) category.name        = name;
  if (icon        !== undefined) category.icon        = icon;
  if (description !== undefined) category.description = description;

  await category.save();
  sendSuccess(res, category, 'Category updated successfully.');
});

// ── DELETE /api/categories/:id ────────────────────────────
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete category "${category.name}" because it has ${productCount} product(s) linked to it. Reassign or delete those products first.`
    );
  }

  await category.deleteOne();
  sendSuccess(res, null, 'Category deleted successfully.');
});
