/**
 * models/Product.js
 *
 * Improvements:
 *  - Added compound indexes for common query patterns
 *    { featured: 1, available: 1 } – home page featured products query
 *    { category: 1, available: 1 } – category filter page query
 *    { sortOrder: 1 }              – manual curation sort
 */

const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url      : { type: String, required: true },   // Cloudinary secure URL
  publicId : { type: String, required: true },   // Cloudinary public_id for deletion
  alt      : { type: String, default: '' },       // Accessibility alt text
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Product name is required'],
      trim     : true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type     : String,
      unique   : true,
      lowercase: true,
      trim     : true,
    },
    description: {
      type    : String,
      required: [true, 'Product description is required'],
      trim    : true,
    },
    category: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'Category',
      required: [true, 'Category is required'],
    },
    price: {
      type    : Number,
      required: [true, 'Price is required'],
      min     : [0, 'Price cannot be negative'],
    },
    images: {
      type    : [ImageSchema],
      default : [],
      validate: {
        validator: (v) => v.length <= 10,
        message  : 'A product can have at most 10 images.',
      },
    },
    featured: {
      type   : Boolean,
      default: false,
    },
    available: {
      type   : Boolean,
      default: true,
    },
    /**
     * dimensions – free-form string: "60cm Diameter", "30x90cm", etc.
     */
    dimensions: {
      type   : String,
      default: null,
      trim   : true,
    },
    /**
     * sku – optional Stock Keeping Unit, e.g. "AR-GD-001"
     */
    sku: {
      type     : String,
      unique   : true,
      sparse   : true, // allow null/undefined (no sku collision)
      trim     : true,
      uppercase: true,
    },
    /**
     * sortOrder – manual curation for the homepage featured section
     */
    sortOrder: {
      type   : Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ── Auto-generate slug from name ──────────────────────────
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ── Single-field indexes ──────────────────────────────────
ProductSchema.index({ name: 'text', description: 'text' }); // full-text search
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ sortOrder: 1 });

// ── Compound indexes for common query patterns ────────────
ProductSchema.index({ featured: 1, available: 1 }); // GET /products/featured
ProductSchema.index({ category: 1, available: 1 }); // GET /products/category/:slug
ProductSchema.index({ category: 1, createdAt: -1 }); // category page sorted by newest

// ── Virtual: thumbnail (first image URL) ─────────────────
ProductSchema.virtual('thumbnail').get(function () {
  return this.images.length > 0 ? this.images[0].url : null;
});

module.exports = mongoose.model('Product', ProductSchema);
