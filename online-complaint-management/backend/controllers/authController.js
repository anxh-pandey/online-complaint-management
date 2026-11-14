const User = require('../models/User');
const { generateToken, HttpError, isValidEmail } = require('../utils/helpers');

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register  (public) - always creates a normal "user" (never an admin)
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) throw new HttpError(400, 'Name must be at least 2 characters');
    if (!isValidEmail(email)) throw new HttpError(400, 'Please provide a valid email');
    if (!password || password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw new HttpError(409, 'That email is already registered');

    // NOTE: role is intentionally NOT read from req.body
    const user = await User.create({ name, email, password, role: 'user' });

    res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  (public) - used by both students and admins
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) throw new HttpError(400, 'Please provide a valid email');
    if (!password) throw new HttpError(400, 'Password is required');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    res.json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (private) - current logged-in user (used for profile + session restore)
const getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};

module.exports = { register, login, getMe };
