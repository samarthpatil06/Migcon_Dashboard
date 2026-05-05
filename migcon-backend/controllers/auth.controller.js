'use strict';
const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET  = process.env.JWT_SECRET  ?? 'change_me_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '8h';

/**
 * POST /api/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid)  return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/register  (supervisor only – enforced in router)
 */
async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username and password required' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.create({ username, password, role: role ?? 'viewer' });
    res.status(201).json({ message: 'User created', username: user.username, role: user.role });
  } catch (err) {
    console.error('[Auth] register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, register };
