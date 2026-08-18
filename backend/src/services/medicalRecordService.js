const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

class MedicalRecordService {
  /**
   * Get medical records for authenticated patient
   */
  async getPatientRecords(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) return [];

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate('doctorId', 'fullName specialization qualification hospitalClinic profilePhoto')
      .populate('appointmentId', 'appointmentDate startTime priorityLevel')
      .sort({ recordDate: -1 });

    return records;
  }

  /**
   * Get medical records accessible to the authenticated doctor
   * Only records tied to this doctor's authorized appointments/consultations
   */
  async getDoctorAuthorizedRecords(userId) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) return [];

    const records = await MedicalRecord.find({ doctorId: doctor._id })
      .populate('patientId', 'fullName phone dateOfBirth gender emergencyContact')
      .populate('appointmentId', 'appointmentDate startTime priorityLevel')
      .sort({ recordDate: -1 });

    return records;
  }

  /**
   * Get single medical record with strict privacy verification
   */
  async getRecordById(recordId, userId, role) {
    const record = await MedicalRecord.findById(recordId)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId')
      .populate('consultationId');

    if (!record) {
      const error = new Error('Medical record not found');
      error.statusCode = 404;
      throw error;
    }

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || record.patientId._id.toString() !== patient._id.toString()) {
        const error = new Error('Unauthorized access to medical record.');
        error.statusCode = 403;
        throw error;
      }
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor || record.doctorId._id.toString() !== doctor._id.toString()) {
        const error = new Error('Unauthorized access to medical record.');
        error.statusCode = 403;
        throw error;
      }
    }

    return record;
  }
}

module.exports = new MedicalRecordService();
