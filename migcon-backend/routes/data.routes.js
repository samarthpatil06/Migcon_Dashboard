'use strict';
const express  = require('express');
const router   = express.Router();
const data     = require('../controllers/data.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All data routes require a valid token (both supervisor and viewer can read)
router.use(verifyToken);

router.get('/latest',  data.getLatest);
router.get('/history', data.getHistory);
router.get('/alerts',  data.getAlerts);

module.exports = router;
