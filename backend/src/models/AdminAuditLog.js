const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'DOCTOR_APPROVED', 'DOCTOR_REJECTED', 'DOCTOR_SUSPENDED',
      'PATIENT_SUSPENDED', 'PATIENT_REACTIVATED',
      'SETTINGS_UPDATED', 'ADMIN_CREATED',
    ],
  },
  targetType: {
    type: String,
    enum: ['doctor', 'patient', 'user', 'system', null],
    default: null,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  remarks: {
    type: String,
    trim: true,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1 });
adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
