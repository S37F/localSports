const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { logEvent } = require('../utils/analytics');

/**
 * Generate access and refresh tokens for a given user
 * @param {Object} user - Mongoose User document
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (user) => {
  const payload = { userId: user._id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register a new user and create an empty profile
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      code: 400,
    });
  }

  const { name, email, password, phone } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists',
        code: 409,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: 'user',
    });

    // Create empty profile linked to user
    await Profile.create({ userId: user._id });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    await logEvent('user.registered', user._id, { role: user.role });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
      code: 500,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      code: 400,
    });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 401,
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
        code: 403,
      });
    }

    // Verify password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 401,
      });
    }

    // Fetch profile completion status
    const profile = await Profile.findOne({ userId: user._id });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    await logEvent('user.login', user._id, { role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken,
        isProfileComplete: profile?.isProfileComplete || false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
      code: 500,
    });
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user.',
      code: 500,
    });
  }
};

module.exports = { register, login, getMe };
