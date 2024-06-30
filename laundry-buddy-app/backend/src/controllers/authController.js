const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { TOKEN_EXPIRY, BlacklistedToken } = require('../models/Token');

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
      { expiresIn: `${TOKEN_EXPIRY}ms` }, // in ms
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
  try {
    const token = await tokenise(req.user.id);
    return res.json({ token });
  } catch (err) {
    next(err);
  }
};

// Logout user and invalidate token
exports.logout = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, cannot log out' });
  }

  const blacklistedToken = await BlacklistedToken.findOne({ token });

  if (blacklistedToken) {
    return res.status(403).json({ msg: 'Blacklisted token used, authorization denied' });
  }

  try {
    const newBlacklistedToken = new BlacklistedToken({
      token,
      exp: new Date(Date.now() + TOKEN_EXPIRY),
    });
    await newBlacklistedToken.save();

    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
