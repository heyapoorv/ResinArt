/**
 * models/Admin.js
 *
 * Single admin user (no registration endpoint – seeded directly).
 * Passwords are stored as bcrypt hashes.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type    : String,
      required: [true, 'Email is required'],
      unique  : true,
      lowercase: true,
      trim    : true,
      match   : [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type    : String,
      required: [true, 'Password is required'],
      select  : false, // never returned in queries by default
    },
  },
  { timestamps: true }
);

// ── Pre-save hook: hash password before storing ──
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Instance method: compare plain password with stored hash ──
AdminSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('Admin', AdminSchema);
