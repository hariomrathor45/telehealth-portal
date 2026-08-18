const mongoose = require('mongoose');

const priorityAssessmentSchema = new mongoose.Schema({
  healthConcernId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthConcern',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  priorityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  priorityLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    required: true,
  },
  assessmentMethod: {
    type: String,
    enum: ['RULE_BASED', 'ML_ASSISTED'],
    default: 'RULE_BASED',
  },
  modelVersion: {
    type: String,
    default: null,
  },
  factorsSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

priorityAssessmentSchema.index({ patientId: 1, createdAt: -1 });
priorityAssessmentSchema.index({ healthConcernId: 1 });
priorityAssessmentSchema.index({ priorityLevel: 1 });

module.exports = mongoose.model('PriorityAssessment', priorityAssessmentSchema);
