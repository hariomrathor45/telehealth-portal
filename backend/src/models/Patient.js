const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', null],
    default: null,
  },
  address: {
    type: String,
    trim: true,
    default: null,
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: null,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

patientSchema.index({ fullName: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
