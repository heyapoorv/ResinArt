/**
 * models/Category.js
 *
 * Derived from frontend category filter chips visible on the
 * Products page and admin product form.
 *
 * Examples seen in frontend:
 *   Ocean Series, Geode Style, Botanical Inlay, Celestial Series,
 *   Clocks, Coasters, Wall Panels, Tabletops, Wearables, Home Decor,
 *   Geode Art, Gold Series, Furniture, Flora Series, Minimalist Series
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
      type  : String,
      unique: true,
      lowercase: true,
      trim  : true,
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

// Auto-generate slug from name before saving
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

module.exports = mongoose.model('Category', CategorySchema);
