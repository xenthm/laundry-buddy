const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machine_id: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: String,
    enum: ['on', 'off'],
    required: true,
  },
}, { versionKey: false });

module.exports = mongoose.model('Machine', MachineSchema);