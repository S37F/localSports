const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Basic authentication middleware to verify JWT
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ success: false, error: 'No token provided', code: 403 });

  const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  if (!token) return res.status(403).json({ success: false, error: 'Malformed token', code: 403 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
        return res.status(401).json({ success: false, error: 'User no longer exists', code: 401 });
    }
    if (!user.isActive) {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated/banned', code: 403 });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles Array of allowed roles (e.g. ['admin'])
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: Insufficient privileges', 
        code: 403 
      });
    }
    next();
  };
};

module.exports = { 
  verifyToken,
  requireRole
};
