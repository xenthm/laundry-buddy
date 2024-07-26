const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    unique: true,
  },
  machineType: {
    type: String, 
    enum: ['washer', 'dryer'],
    required: true,
  },
  floor: {
    type: Number, 
    required: true, 
  }, 
  state: {
    type: String,
    enum: ['on', 'off'],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Date,
  },
}, { versionKey: false });

module.exports = mongoose.model('Machine', MachineSchema);