const crypto = require('crypto');
const User = require('../models/User');

// TODO maybe implement a cleanup function to automatically remove old reset password tokens

// Forget password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 120 * 1000; // 1 min
    await user.save();

    // send reset email function goes here
    // const resetUrl = 'http://localhost:5000/reset-password/${resetToken}';
    // await sendResetEmail(user.email, resetUrl);
    // res.json({ msg: 'Reset password link has been sent to your email' });

    // send the raw token for now as a proof of concept
    res.json({ resetToken });
  } catch (err) {
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
    }
      
    if (!password) {
        return res.status(400).json({ msg: 'Please provide new password' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};