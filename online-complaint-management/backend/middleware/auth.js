const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HttpError } = require('../utils/helpers');

// Verifies the JWT sent as "Authorization: Bearer <token>" and attaches req.user
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Not authorized, token missing');
    }
    const token = header.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(401, 'Not authorized, token invalid or expired');
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new HttpError(401, 'User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Role-based authorization: authorize('admin'), authorize('user', 'admin') ...
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Access denied: you do not have permission'));
    }
    next();
  };

module.exports = { protect, authorize };
