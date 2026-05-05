'use strict';
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    deviceId:  { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    type:      { type: String, default: 'alarm' },
    message:   { type: String },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Alert', alertSchema);
