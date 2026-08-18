const HealthConcern = require('../models/HealthConcern');
const PriorityAssessment = require('../models/PriorityAssessment');
const Patient = require('../models/Patient');
const { calculatePriority } = require('../utils/priorityEngine');

class PriorityService {
  /**
   * Submit health concern and calculate priority assessment
   */
  async assessHealthConcern(userId, { mainConcern, symptoms = [], duration = 'today', severity = 'mild', optionalInformation = '' }) {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      const error = new Error('Patient profile not found');
      error.statusCode = 404;
      throw error;
    }

    if (!mainConcern || !mainConcern.trim()) {
      const error = new Error('Main health concern is required');
      error.statusCode = 400;
      throw error;
    }

    // 1. Save Health Concern
    const healthConcern = new HealthConcern({
      patientId: patient._id,
      mainConcern: mainConcern.trim(),
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      duration,
      severity,
      optionalInformation: optionalInformation ? optionalInformation.trim() : null,
    });
    await healthConcern.save();

    // 2. Run Priority Engine
    const calculation = calculatePriority({
      mainConcern,
      symptoms: healthConcern.symptoms,
      duration,
      severity,
      optionalInformation,
    });

    // 3. Save Priority Assessment record
    const assessment = new PriorityAssessment({
      healthConcernId: healthConcern._id,
      patientId: patient._id,
      priorityScore: calculation.priorityScore,
      priorityLevel: calculation.priorityLevel,
      assessmentMethod: calculation.assessmentMethod,
      modelVersion: calculation.modelVersion,
      factorsSummary: calculation.factorsSummary,
    });
    await assessment.save();

    return {
      healthConcern,
      assessment: {
        id: assessment._id,
        priorityScore: assessment.priorityScore,
        priorityLevel: assessment.priorityLevel,
        factorsSummary: calculation.factorsSummary,
        isEmergencyAlert: calculation.isEmergencyAlert,
        emergencyMessage: calculation.emergencyMessage,
        disclaimer: calculation.disclaimer,
      },
    };
  }

  /**
   * Get specific priority assessment details
   */
  async getAssessmentDetails(assessmentId, userId, userRole) {
    const assessment = await PriorityAssessment.findById(assessmentId)
      .populate('healthConcernId')
      .populate('patientId', 'fullName dateOfBirth gender phone');

    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    // Security check: If patient, must be own assessment
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || assessment.patientId._id.toString() !== patient._id.toString()) {
        const error = new Error('Unauthorized access to medical priority record');
        error.statusCode = 403;
        throw error;
      }
    }

    return assessment;
  }
}

module.exports = new PriorityService();
