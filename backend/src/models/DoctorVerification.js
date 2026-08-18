const mongoose = require('mongoose');

const doctorVerificationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  submittedDocuments: [{
    documentType: {
      type: String,
      enum: ['medical_license', 'degree_certificate', 'identity_document', 'profile_photo', 'other'],
      required: true,
    },
    storageKey: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    documentStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'NOT_VERIFIED', 'NEEDS_REVIEW'],
      default: 'PENDING',
    },
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  overallStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  remarks: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

doctorVerificationSchema.index({ doctorId: 1 });
doctorVerificationSchema.index({ overallStatus: 1 });

module.exports = mongoose.model('DoctorVerification', doctorVerificationSchema);
