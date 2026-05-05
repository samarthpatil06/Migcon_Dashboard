'use strict';
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['supervisor', 'viewer'], default: 'viewer' },
  },
  { versionKey: false }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Compare plain password with hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
