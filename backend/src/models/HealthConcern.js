const mongoose = require('mongoose');

const healthConcernSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  mainConcern: {
    type: String,
    required: [true, 'Main health concern is required'],
    trim: true,
    maxlength: 500,
  },
  symptoms: [{
    type: String,
    trim: true,
  }],
  duration: {
    type: String,
    enum: ['today', '1-3 days', '4-7 days', 'more than 7 days', null],
    default: null,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', null],
    default: null,
  },
  optionalInformation: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

healthConcernSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('HealthConcern', healthConcernSchema);
