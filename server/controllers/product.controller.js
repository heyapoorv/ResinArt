/**
 * controllers/product.controller.js
 *
 * Public endpoints (no auth):
 *   GET  /api/products            – list with pagination, filter, sort, search
 *   GET  /api/products/featured   – featured products (home page)
 *   GET  /api/products/search     – full-text search  (?q=term)
 *   GET  /api/products/category/:slug – filter by category slug
 *   GET  /api/products/:id        – single product detail
 *
 * Protected endpoints (admin JWT required):
 *   POST   /api/products          – create product + upload images
 *   PUT    /api/products/:id      – update product (partial)
 *   DELETE /api/products/:id      – delete product + remove images from Cloudinary
 */

const Product   = require('../models/Product');
const Category  = require('../models/Category');
const asyncHandler   = require('../utils/asyncHandler');
const ApiError       = require('../utils/ApiError');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/ApiResponse');
const { buildFilter, buildSort, paginate }        = require('../services/product.service');
const { deleteImages, filesToImageDocs }          = require('../services/cloudinary.service');

// ── GET /api/products ─────────────────────────────────────
exports.getProducts = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 12);
  const filter = buildFilter(req.query);
  const sort   = buildSort(req.query.sort);

  const { docs, pagination } = await paginate(filter, sort, page, limit);
  sendPaginated(res, docs, pagination);
});

// ── GET /api/products/featured ────────────────────────────
exports.getFeaturedProducts = asyncHandler(async (_req, res) => {
  const products = await Product
    .find({ featured: true, available: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(12)
    .populate('category', 'name slug');

  sendSuccess(res, products);
});

// ── GET /api/products/search?q= ──────────────────────────
exports.searchProducts = asyncHandler(async (req, res) => {
  const q     = (req.query.q || '').trim();
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);

  if (!q) {
    // Return all products when query is empty
    const filter = buildFilter({});
    const sort   = buildSort('newest');
    const { docs, pagination } = await paginate(filter, sort, page, limit);
    return sendPaginated(res, docs, pagination);
  }

  const filter = { $text: { $search: q } };
  const sort   = { score: { $meta: 'textScore' }, createdAt: -1 };

  const total = await Product.countDocuments(filter);
  const docs  = await Product
    .find(filter, { score: { $meta: 'textScore' } })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug');

  sendPaginated(res, docs, {
    total,
    page,
    limit,
    pages      : Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  }, `Found ${total} result(s) for "${q}"`);
});

// ── GET /api/products/category/:slug ─────────────────────
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page     = Math.max(1, parseInt(req.query.page)  || 1);
  const limit    = Math.min(50, parseInt(req.query.limit) || 12);
  const sort     = buildSort(req.query.sort);

  // Resolve category by slug OR name (flexibility for frontend)
  const category = await Category.findOne({
    $or: [{ slug }, { name: { $regex: new RegExp(`^${slug}$`, 'i') } }],
  });

  if (!category) throw new ApiError(404, `Category "${slug}" not found.`);

  const filter = { category: category._id };
  const { docs, pagination } = await paginate(filter, sort, page, limit);

  sendPaginated(res, docs, pagination, `Products in "${category.name}"`);
});

// ── GET /api/products/:id ─────────────────────────────────
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product
    .findById(req.params.id)
    .populate('category', 'name slug icon');

  if (!product) throw new ApiError(404, 'Product not found.');

  // Fetch 3 related products from the same category (for product detail page)
  const related = await Product
    .find({
      category: product.category._id,
      _id     : { $ne: product._id },
      available: true,
    })
    .limit(3)
    .select('name price images dimensions slug');

  sendSuccess(res, { product, related });
});

// ── POST /api/products ────────────────────────────────────
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, category, price,
    featured, available, dimensions, sku, sortOrder,
  } = req.body;

  // Verify category exists
  const cat = await Category.findById(category);
  if (!cat) throw new ApiError(400, 'Provided category does not exist.');

  // Build image documents from uploaded files
  const images = filesToImageDocs(req.files || []);

  const product = await Product.create({
    name, description, category, price,
    featured : featured === 'true' || featured === true,
    available: available !== 'false' && available !== false,
    dimensions, sku, sortOrder,
    images,
  });

  await product.populate('category', 'name slug');
  sendCreated(res, product, 'Product created successfully.');
});

// ── PUT /api/products/:id ─────────────────────────────────
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');

  const {
    name, description, category, price,
    featured, available, dimensions, sku, sortOrder,
    removeImages, // JSON array of publicIds to remove e.g. ["abc","xyz"]
  } = req.body;

  // Apply scalar updates
  if (name        !== undefined) product.name        = name;
  if (description !== undefined) product.description = description;
  if (price       !== undefined) product.price       = price;
  if (dimensions  !== undefined) product.dimensions  = dimensions;
  if (sku         !== undefined) product.sku         = sku;
  if (sortOrder   !== undefined) product.sortOrder   = sortOrder;
  if (featured    !== undefined) product.featured    = featured === 'true' || featured === true;
  if (available   !== undefined) product.available   = available !== 'false' && available !== false;

  if (category !== undefined) {
    const cat = await Category.findById(category);
    if (!cat) throw new ApiError(400, 'Provided category does not exist.');
    product.category = category;
  }

  // Handle image removal
  if (removeImages) {
    let toRemove = [];
    try { toRemove = JSON.parse(removeImages); } catch (_) {}
    if (Array.isArray(toRemove) && toRemove.length > 0) {
      const removingDocs = product.images.filter((img) => toRemove.includes(img.publicId));
      await deleteImages(removingDocs);
      product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
    }
  }

  // Append newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = filesToImageDocs(req.files);
    product.images.push(...newImages);
    if (product.images.length > 10) {
      product.images = product.images.slice(-10);
    }
  }

  await product.save();
  await product.populate('category', 'name slug');

  sendSuccess(res, product, 'Product updated successfully.');
});

// ── DELETE /api/products/:id ──────────────────────────────
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');

  // Remove all images from Cloudinary
  await deleteImages(product.images);

  await product.deleteOne();

  sendSuccess(res, null, 'Product deleted successfully.');
});

// ── GET /api/products/stats ───────────────────────────────
exports.getStats = asyncHandler(async (_req, res) => {
  const [total, featured, available, categories] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ featured: true }),
    Product.countDocuments({ available: true }),
    Product.distinct('category'),
  ]);

  sendSuccess(res, { total, featured, available, categoryCount: categories.length });
});
