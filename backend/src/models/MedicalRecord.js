const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    default: null,
  },
  recordDate: {
    type: Date,
    default: Date.now,
  },
  complaint: { type: String, trim: true, default: null },
  consultationSummary: { type: String, trim: true, default: null },
  observations: { type: String, trim: true, default: null },
  advice: { type: String, trim: true, default: null },
  followUp: { type: String, trim: true, default: null },
  attachments: [{
    fileName: String,
    storageKey: String,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
medicalRecordSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
