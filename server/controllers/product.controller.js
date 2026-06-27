/**
 * controllers/product.controller.js
 *
 * Improvements:
 *  - Cache-Control headers on GET /featured (short TTL, stale-while-revalidate)
 *  - Image count validation on update (prevent > 10 total)
 *  - Cloudinary image upload logged
 */

const Product   = require('../models/Product');
const Category  = require('../models/Category');
const asyncHandler   = require('../utils/asyncHandler');
const ApiError       = require('../utils/ApiError');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/ApiResponse');
const { buildFilter, buildSort, paginate }        = require('../services/product.service');
const { deleteImages, filesToImageDocs }          = require('../services/cloudinary.service');
const logger         = require('../utils/logger');

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

  // Short cache for featured products – safe for public CDN caching
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=60');

  sendSuccess(res, products);
});

// ── GET /api/products/search?q= ──────────────────────────
exports.searchProducts = asyncHandler(async (req, res) => {
  const q     = (req.query.q || '').trim();
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);

  if (!q) {
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

  const cat = await Category.findById(category);
  if (!cat) throw new ApiError(400, 'Provided category does not exist.');

  const images = filesToImageDocs(req.files || []);

  const product = await Product.create({
    name, description, category, price,
    featured : featured === 'true' || featured === true,
    available: available !== 'false' && available !== false,
    dimensions, sku, sortOrder,
    images,
  });

  if (images.length > 0) {
    logger.info('Product images uploaded', { productId: product._id, count: images.length });
  }

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
    removeImages,
  } = req.body;

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
    // Enforce 10-image limit
    if (product.images.length > 10) {
      throw new ApiError(400, `Cannot exceed 10 images per product. Current: ${product.images.length}`);
    }
    logger.info('Product images added', { productId: product._id, added: newImages.length });
  }

  await product.save();
  await product.populate('category', 'name slug');

  sendSuccess(res, product, 'Product updated successfully.');
});

// ── DELETE /api/products/:id ──────────────────────────────
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');

  await deleteImages(product.images);
  logger.info('Product deleted', { productId: product._id, name: product.name });

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
