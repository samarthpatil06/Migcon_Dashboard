'use strict';
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/iotDashboard';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] MongoDB connected →', MONGO_URI);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
