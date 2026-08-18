const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
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
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
  complaint: { type: String, trim: true, default: null },
  summary: { type: String, trim: true, default: null },
  doctorObservations: { type: String, trim: true, default: null },
  advice: { type: String, trim: true, default: null },
  followUp: { type: String, trim: true, default: null },
  doctorNotes: { type: String, trim: true, default: null },
}, {
  timestamps: true,
});

consultationSchema.index({ appointmentId: 1 }, { unique: true });
consultationSchema.index({ patientId: 1, createdAt: -1 });
consultationSchema.index({ doctorId: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
