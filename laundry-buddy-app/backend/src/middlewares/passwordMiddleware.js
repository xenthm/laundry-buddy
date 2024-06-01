const User = require('../models/User');

const verifyPassword = async (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ msg: 'Please provide password' });
  }

  try {
    if (req.originalUrl === '/api/auth/login') {
      const { username } = req.body;
      req.user = await User.findOne({ username });
      
      if (!req.user) {
        return res.status(400).json({ msg: 'User does not exist' });
      }
    } else if (req.originalUrl === '/api/user/change-password') {
      if (!req.user) {
        return res.status(404).json({ msg: 'User not found' });
      }
    }

    const isMatch = await req.user.matchPassword(password);
    if (!isMatch) {
      let msg = 'is incorrect';
      if (req.originalUrl === '/api/auth/login') {
        msg = 'Password ' + msg;
      } else if (req.originalUrl === '/api/user/change-password') {
        msg = 'Current password ' + msg;
      }
      return res.status(400).json({ msg: msg });
    }
    
    if (req.originalUrl === '/api/user/change-password') {
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