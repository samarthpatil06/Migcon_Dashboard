'use strict';
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ?? 'change_me_in_production';

/**
 * verifyToken – attaches decoded payload to req.user
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * checkRole – factory that accepts one or more allowed roles
 * Usage: checkRole('supervisor')  or  checkRole('supervisor', 'viewer')
 */
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { verifyToken, checkRole };
