const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Escape user input before putting it inside a RegExp (prevents regex injection)
const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Small helper to throw errors with an HTTP status code
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email || '');

module.exports = { generateToken, escapeRegex, HttpError, isValidEmail };
