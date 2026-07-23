const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existing) {
      return res.status(409).json({
        message:
          existing.email === email.toLowerCase()
            ? 'Email is already registered'
            : 'Username is already taken',
      });
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user);

    return res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth] signup error:', err);
    return res.status(500).json({ message: 'Failed to sign up' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ message: 'Failed to log in' });
  }
}

async function me(req, res) {
  return res.json({ user: req.user.toPublicJSON() });
}

async function updateFcmToken(req, res) {
  try {
    const { fcmToken } = req.body;
    req.user.fcmToken = fcmToken || null;
    await req.user.save();
    return res.json({ message: 'FCM token updated' });
  } catch (err) {
    console.error('[auth] updateFcmToken error:', err);
    return res.status(500).json({ message: 'Failed to update FCM token' });
  }
}

module.exports = { signup, login, me, updateFcmToken };
