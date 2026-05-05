'use strict';
const SensorData = require('../models/sensorData.model');
const Alert      = require('../models/alert.model');

/**
 * GET /api/latest
 * Returns the most recent record for each deviceId.
 */
async function getLatest(req, res) {
  try {
    const latest = await SensorData.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$deviceId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);
    res.json(latest);
  } catch (err) {
    console.error('[API] getLatest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/history
 * Optional query params: deviceId, from (ISO), to (ISO), limit (default 200)
 */
async function getHistory(req, res) {
  try {
    const { deviceId, from, to, limit = 200 } = req.query;
    const filter = {};

    if (deviceId) filter.deviceId = deviceId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const records = await SensorData
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(records);
  } catch (err) {
    console.error('[API] getHistory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/alerts
 * Optional query params: deviceId, limit (default 100)
 */
async function getAlerts(req, res) {
  try {
    const { deviceId, limit = 100 } = req.query;
    const filter = deviceId ? { deviceId } : {};

    const alerts = await Alert
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(alerts);
  } catch (err) {
    console.error('[API] getAlerts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLatest, getHistory, getAlerts };
