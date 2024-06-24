const User = require('../models/User');

const verifyPassword = async (req, res, next) => {
  try {
    if (req.originalUrl === '/api/auth/login') {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ msg: 'Please provide username' });
      }

      req.user = await User.findOne({ username });
      
      if (!req.user) {
        return res.status(400).json({ msg: 'User does not exist' });
      }
    } else if (req.originalUrl === '/api/user/change-password') {
      if (!req.user) {
        return res.status(404).json({ msg: 'User not found' });
      }
    }

    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ msg: 'Please provide password' });
    }

    const isMatch = await req.user.matchPassword(password);
    if (req.originalUrl === '/api/auth/login') {
      if (!isMatch) {
        return res.status(401).json({ msg: 'Password is incorrect' });
      }
    } else if (req.originalUrl === '/api/user/change-password') {
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ msg: 'Please provide new password' });
      }

      if (password === newPassword) {
        return res.status(400).json({ msg: 'New password cannot be the same as current password' });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyPassword;