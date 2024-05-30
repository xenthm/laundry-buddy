const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
// TODO Checks for same username, and email, plus corresponding responses
exports.updateUserProfile = async (req, res, next) => {
  const { username, email } = req.body;

  try {
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
    await User.findByIdAndRemove(req.user.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
