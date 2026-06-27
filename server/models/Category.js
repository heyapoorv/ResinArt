/**
 * models/Category.js
 *
 * Improvements:
 *  - Added index on name for sort performance
 *  - Added pre('findOneAndUpdate') hook to regenerate slug on name updates
 */

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Category name is required'],
      unique   : true,
      trim     : true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    slug: {
      type     : String,
      unique   : true,
      lowercase: true,
      trim     : true,
    },
    icon: {
      type   : String, // optional – Material Symbol name or emoji
      default: null,
    },
    description: {
      type   : String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────
CategorySchema.index({ name: 1 });   // sort performance
CategorySchema.index({ slug: 1 });   // slug lookups (route: /products/category/:slug)

// ── Auto-generate slug from name on create ────────────────
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ── Regenerate slug on findOneAndUpdate when name changes ─
CategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const name   = update?.name || update?.$set?.name;
  if (name) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.set({ slug });
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
