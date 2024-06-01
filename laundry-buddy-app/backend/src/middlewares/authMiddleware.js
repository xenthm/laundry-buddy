const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const auth = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    req.user = await User.findById(decoded.user.id).select('-password');
      
    if (!req.user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }

};

module.exports = auth;