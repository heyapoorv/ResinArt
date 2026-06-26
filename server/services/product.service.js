/**
 * services/product.service.js
 *
 * Business logic for product queries – pagination, filtering,
 * sorting, full-text search.  Controllers call these helpers
 * to keep themselves thin and readable.
 */

const Product = require('../models/Product');

/**
 * Build a Mongoose query filter from request query params.
 *
 * Supported params:
 *   q        – full-text search against name + description
 *   category – category ObjectId
 *   featured – "true" | "false"
 *   available– "true" | "false"
 *   minPrice – number
 *   maxPrice – number
 */
const buildFilter = (query = {}) => {
  const filter = {};

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.featured !== undefined) {
    filter.featured = query.featured === 'true';
  }

  if (query.available !== undefined) {
    filter.available = query.available === 'true';
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

/**
 * Build a Mongoose sort object from the "sort" query param.
 *
 * Values (match frontend dropdown options):
 *   newest       → { createdAt: -1 }   (default)
 *   oldest       → { createdAt:  1 }
 *   price_asc    → { price:  1 }
 *   price_desc   → { price: -1 }
 *   featured     → { featured: -1, createdAt: -1 }
 */
const buildSort = (sort = 'newest') => {
  const map = {
    newest    : { createdAt: -1 },
    oldest    : { createdAt:  1 },
    price_asc : { price:  1 },
    price_desc: { price: -1 },
    featured  : { featured: -1, createdAt: -1 },
  };
  return map[sort] || { createdAt: -1 };
};

/**
 * Paginate any Mongoose query.
 * Returns { docs, pagination }.
 */
const paginate = async (filter, sort, page = 1, limit = 12, populate = 'category') => {
  const skip  = (page - 1) * limit;
  const total = await Product.countDocuments(filter);

  const docs = await Product
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate(populate, 'name slug icon');

  return {
    docs,
    pagination: {
      total,
      page,
      limit,
      pages      : Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

module.exports = { buildFilter, buildSort, paginate };
