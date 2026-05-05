'use strict';
const express  = require('express');
const router   = express.Router();
const auth     = require('../controllers/auth.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Public
router.post('/login', auth.login);

// Supervisor only
router.post('/register', verifyToken, checkRole('supervisor'), auth.register);

module.exports = router;
