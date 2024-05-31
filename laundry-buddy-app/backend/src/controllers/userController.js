const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  const { username, email } = req.body;

  try {
    if (username === req.user.username) {
      return res.status(400).json({ msg: 'New username cannot be the same as current username' });
    }

    if (email === req.user.email) {
      return res.status(400).json({ msg: 'New email cannot be the same as current email' });
    }

    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;

    await req.user.save();
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    req.user.password = newPassword;
    await req.user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    next(err);
  }
};