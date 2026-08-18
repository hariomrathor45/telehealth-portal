const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6, // 0=Sunday, 6=Saturday
  },
  startTime: {
    type: String, // "09:00" format
    required: true,
  },
  endTime: {
    type: String, // "17:00" format
    required: true,
  },
  breaks: [{
    startTime: String,
    endTime: String,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
}, {
  timestamps: true,
});

doctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
