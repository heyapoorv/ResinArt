/**
 * models/Product.js
 *
 * Mirrors every field visible across the frontend:
 *   - Home page: Featured Collection cards (name, category, price, images, featured)
 *   - Products page: grid cards + filter/sort (name, category, price, available, images)
 *   - Product Detail: name, description, price, dimensions, images[], category
 *   - Admin Products table: name, category, price, featured (toggle), available
 *   - Admin Dashboard: total products count, featured count
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
     * dimensions – free-form string to match frontend display:
     * "60cm Diameter", "30x90cm", "45cm Diameter", etc.
     */
    dimensions: {
      type   : String,
      default: null,
      trim   : true,
    },
    /**
     * sku – optional Stock Keeping Unit visible in admin table
     * e.g. "AR-CD-004", "AR-GD-112"
     */
    sku: {
      type  : String,
      unique: true,
      sparse: true, // allow null/undefined
      trim  : true,
      uppercase: true,
    },
    /**
     * sortOrder – used for manual curation on the homepage
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

// ── Auto-generate slug from name ──
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

// ── Indexes for search, filter, sort ──
ProductSchema.index({ name: 'text', description: 'text' }); // full-text search
ProductSchema.index({ category: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// ── Virtual: thumbnail (first image URL) ──
ProductSchema.virtual('thumbnail').get(function () {
  return this.images.length > 0 ? this.images[0].url : null;
});

module.exports = mongoose.model('Product', ProductSchema);
