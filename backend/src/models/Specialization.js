const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Specialization', specializationSchema);
