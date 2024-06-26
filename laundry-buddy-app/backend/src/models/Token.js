const mongoose = require('mongoose');

exports.TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;  // 7 days

const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  exp: {
    type: Date,
    required: true, 
  },
}, { versionKey: false });

exports.BlacklistedToken = mongoose.model('BlacklistedToken', TokenSchema);

// Periodically clean up the blacklist
const intervalId = setInterval(async () => {
  const currentTime = new Date();
  await exports.BlacklistedToken.deleteMany({ exp: { $lte: currentTime } }).exec();
  console.log(`Expired tokens cleared from blacklisted tokens at ${currentTime.toString()}`);
}, exports.TOKEN_EXPIRY); // time interval

// Stops the interval (for testing)
exports.stopInterval = () => {
  clearInterval(intervalId);
}

// Clears token from blacklisted tokens (for testing)
exports.clearBlacklistedToken = async (token) => {
  try {
    await this.BlacklistedToken.findOneAndDelete({ token });
    return true;
  } catch (err) {
    console.warn(err);
  }
}