import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const emailRegex = /^\S+@\S+\.\S+$/;

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id),
});

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!email || !emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email');
  }
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must contain at least 6 characters');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // role is never taken from the request body
  const user = await User.create({ name, email, password });
  res.status(201).json(userResponse(user));
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(userResponse(user));
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};