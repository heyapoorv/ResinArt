/**
 * controllers/category.controller.js
 *
 * Improvements:
 *  - Fixed N+1 query: replaced Promise.all(map(countDocuments)) with a single
 *    MongoDB aggregation ($lookup + $count) to get product counts in one round-trip
 */

const Category     = require('../models/Category');
const Product      = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../utils/ApiResponse');

// ── GET /api/categories ───────────────────────────────────
exports.getCategories = asyncHandler(async (_req, res) => {
  /**
   * Single aggregation instead of N+1 countDocuments calls.
   * Looks up products for each category and counts them.
   */
  const categories = await Category.aggregate([
    { $sort: { name: 1 } },
    {
      $lookup: {
        from        : 'products',
        localField  : '_id',
        foreignField: 'category',
        as          : 'products',
      },
    },
    {
      $addFields: {
        productCount: { $size: '$products' },
      },
    },
    {
      $project: {
        products: 0, // don't return the full products array
      },
    },
  ]);

  sendSuccess(res, categories);
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
