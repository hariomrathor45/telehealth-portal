const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  phone: { type: String, trim: true, default: null },
  dateOfBirth: { type: Date, default: null },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null],
    default: null,
  },
  address: { type: String, trim: true, default: null },
  medicalRegistrationNumber: {
    type: String,
    required: [true, 'Medical registration number is required'],
    unique: true,
    trim: true,
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    trim: true,
  },
  specialization: {
    type: String,
    trim: true,
    default: null,
  },
  experienceYears: { type: Number, default: 0, min: 0, max: 60 },
  hospitalClinic: { type: String, trim: true, default: null },
  consultationFee: { type: Number, default: 0, min: 0 },
  bio: { type: String, trim: true, maxlength: 1000, default: null },
  profilePhoto: { type: String, default: null },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'DISABLED'],
    default: 'ACTIVE',
  },
  verificationRemarks: { type: String, default: null },
  approvedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ accountStatus: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ fullName: 'text', qualification: 'text', hospitalClinic: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
