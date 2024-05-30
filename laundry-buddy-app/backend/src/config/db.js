const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Listen for runtime errors
    mongoose.connection.on('error', err => {
      console.error('Runtime connection error: ', err.message);
    })
    .on('disconnected', () => {
      console.warn('Mongoose connection disconnected');
      console.log('Attempting to reconnect to MongoDB...'); // Mongoose will attempt to reconnect
    })
    .on('reconnected', () => {
      console.log('Mongoose reconnected to MongoDB');
    });
  } catch (err) {
    console.error('Initial connection error: ', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;