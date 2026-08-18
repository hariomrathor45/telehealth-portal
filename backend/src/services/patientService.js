const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const PriorityAssessment = require('../models/PriorityAssessment');

class PatientService {
  /**
   * Complete rich Patient Dashboard data
   */
  async getDashboardData(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      const error = new Error('Patient profile not found');
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();

    // Fetch live parallel data
    const [
      upcomingAppointments,
      activeWaitingAppointment,
      recentRecords,
      unreadNotificationsCount,
      totalAppointmentsCount,
      totalRecordsCount,
      recommendedDoctors
    ] = await Promise.all([
      // Upcoming appointments
      Appointment.find({
        patientId: patient._id,
        status: { $in: ['REQUESTED', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION'] },
      })
        .populate('doctorId', 'fullName specialization qualification consultationFee hospitalClinic profilePhoto')
        .sort({ appointmentDate: 1, startTime: 1 })
        .limit(3),

      // Latest waiting appointment with priority assessment
      Appointment.findOne({
        patientId: patient._id,
        status: { $in: ['WAITING', 'IN_CONSULTATION'] },
      })
        .populate('doctorId', 'fullName specialization')
        .populate('priorityAssessmentId')
        .populate('healthConcernId')
        .sort({ updatedAt: -1 }),

      // Recent medical records
      MedicalRecord.find({ patientId: patient._id })
        .populate('doctorId', 'fullName specialization')
        .sort({ recordDate: -1 })
        .limit(3),

      // Unread notifications
      Notification.countDocuments({ userId, readAt: null }),

      // Total appointments
      Appointment.countDocuments({ patientId: patient._id }),

      // Total records
      MedicalRecord.countDocuments({ patientId: patient._id }),

      // Top approved doctors for quick discovery
      Doctor.find({ verificationStatus: 'APPROVED', accountStatus: 'ACTIVE' })
        .select('fullName specialization qualification experienceYears consultationFee hospitalClinic bio profilePhoto')
        .sort({ experienceYears: -1 })
        .limit(4)
    ]);

    return {
      profile: patient,
      stats: {
        upcomingCount: upcomingAppointments.length,
        totalAppointments: totalAppointmentsCount,
        totalRecords: totalRecordsCount,
        unreadNotifications: unreadNotificationsCount,
      },
      upcomingAppointments,
      activeWaitingAppointment,
      recentRecords,
      recommendedDoctors,
    };
  }

  /**
   * Get patient profile
   */
  async getProfile(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) throw new Error('Patient profile not found');
    return patient;
  }

  /**
   * Update patient profile
   */
  async updateProfile(userId, updateData) {
    const patient = await Patient.findOne({ userId });
    if (!patient) throw new Error('Patient not found');

    const allowedFields = ['fullName', 'phone', 'dateOfBirth', 'gender', 'address', 'emergencyContact', 'profilePhoto'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        patient[field] = updateData[field];
      }
    });

    await patient.save();
    return patient;
  }
}

module.exports = new PatientService();
