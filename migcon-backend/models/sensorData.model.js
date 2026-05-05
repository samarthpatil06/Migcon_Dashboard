'use strict';
const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name:  { type: String },
    value: { type: mongoose.Schema.Types.Mixed },
    raw:   { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const sensorDataSchema = new mongoose.Schema(
  {
    deviceId:      { type: String, required: true, index: true }, // mac
    modelCode:     { type: String },
    modelName:     { type: String },
    rssi:          { type: Number },
    ipType:        { type: String },
    power:         { type: String },
    batteryVolts:  { type: Number },
    loggingStatus: { type: String },
    logging:       { type: Boolean },
    alarm:         { type: Boolean },
    alarmCode:     { type: String },
    logCount:      { type: Number },
    channels:      [channelSchema],
    timestamp:     { type: Number },
    packetNumber:  { type: Number },
    header:        { type: String },
    createdAt:     { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('SensorData', sensorDataSchema);
