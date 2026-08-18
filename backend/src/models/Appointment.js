const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  healthConcernId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthConcern',
    default: null,
  },
  priorityAssessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PriorityAssessment',
    default: null,
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  startTime: {
    type: String, // "10:00" format
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String,
    default: null,
  },
  priorityLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    default: 'LOW',
  },
  priorityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
    default: 'REQUESTED',
  },
  queueEnteredAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
    default: null,
  },
  cancellationReason: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
});

appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ priorityLevel: 1 });
appointmentSchema.index({ doctorId: 1, status: 1, priorityScore: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
