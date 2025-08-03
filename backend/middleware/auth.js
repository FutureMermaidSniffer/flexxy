const jwt = require('jsonwebtoken');
const { getOne } = require('../database');


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    const user = await getOne('SELECT id, email, user_type, is_active FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};


const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    const user = await getOne('SELECT id, email, user_type, is_active FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user || !user.is_active) {
      req.user = null;
    } else {
      req.user = user;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};


const requireEmployer = (req, res, next) => {
  if (req.user.user_type !== 'employer' && req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Employer access required' });
  }
  next();
};


const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};


const requireOwnershipOrAdmin = (userIdField = 'user_id') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.user_type === 'admin' || req.user.id == resourceUserId) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireEmployer,
  requireAdmin,
  requireOwnershipOrAdmin
};
