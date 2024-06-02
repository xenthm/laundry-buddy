const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Token generator
const tokenise = id => {
  return new Promise((resolve, reject) => {
    const payload = {
      user: {
        id: id
      }
    };

    jwt.sign(
      payload, 
      process.env.SECRET_KEY,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please provide username, email, and password' });
  }

  try {
    let user = await User.findOne({ $or: [{ username }, { email }] });
    
    if (user) {
      if (email === user.email) {
        return res.status(400).json({ msg: 'This email address is already been registered' });
      } else if (username === user.username) {
        return res.status(400).json({ msg: 'Username is already in use, please provide a different username' });
      }
    }

    user = new User({ username, email, password });
    await user.save();

    const token = await tokenise(user.id);
    return res.json({ token });
  } catch (err) {
    next(err);
  }
};

// Authenticate user and get token
exports.login = async (req, res, next) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ msg: 'Please provide username' });
  }

  try {
    const token = await tokenise(req.user.id);
    return res.json({ token });
  } catch (err) {
    next(err);
  }
};
