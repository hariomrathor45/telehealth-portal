const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');

class ConsultationService {
  /**
   * Start a consultation session from an appointment
   */
  async startConsultation(appointmentId, doctorUserId) {
    const doctor = await Doctor.findOne({ userId: doctorUserId });
    if (!doctor) throw new Error('Doctor profile not found');

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('healthConcernId');

    if (!appointment) throw new Error('Appointment not found');
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      const error = new Error('You are not authorized to conduct this consultation.');
      error.statusCode = 403;
      throw error;
    }

    // Set appointment in progress
    appointment.status = 'IN_CONSULTATION';
    await appointment.save();

    // Check existing consultation
    let consultation = await Consultation.findOne({ appointmentId });
    if (!consultation) {
      consultation = new Consultation({
        appointmentId: appointment._id,
        patientId: appointment.patientId._id,
        doctorId: doctor._id,
        startedAt: new Date(),
        status: 'IN_PROGRESS',
        complaint: appointment.healthConcernId?.mainConcern || null,
      });
      await consultation.save();
    } else {
      consultation.status = 'IN_PROGRESS';
      if (!consultation.startedAt) consultation.startedAt = new Date();
      await consultation.save();
    }

    // Notify patient
    const patientUser = await Patient.findById(appointment.patientId).populate('userId');
    if (patientUser?.userId) {
      await Notification.create({
        userId: patientUser.userId._id,
        type: 'CONSULTATION',
        title: '🩺 Consultation Started',
        message: `Dr. ${doctor.fullName} has started your consultation session.`,
        relatedEntityType: 'consultation',
        relatedEntityId: consultation._id,
      });
    }

    return { consultation, appointment };
  }

  /**
   * Save doctor consultation notes during session
   */
  async saveConsultationNotes(consultationId, doctorUserId, data) {
    const doctor = await Doctor.findOne({ userId: doctorUserId });
    if (!doctor) throw new Error('Doctor not found');

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new Error('Consultation not found');

    if (consultation.doctorId.toString() !== doctor._id.toString()) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    const fields = ['complaint', 'summary', 'doctorObservations', 'advice', 'followUp', 'doctorNotes'];
    fields.forEach(f => {
      if (data[f] !== undefined) consultation[f] = data[f];
    });

    await consultation.save();
    return consultation;
  }

  /**
   * Finalize consultation and automatically generate immutable Medical Record
   */
  async completeConsultation(consultationId, doctorUserId, data = {}) {
    const doctor = await Doctor.findOne({ userId: doctorUserId });
    if (!doctor) throw new Error('Doctor not found');

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new Error('Consultation not found');

    if (consultation.doctorId.toString() !== doctor._id.toString()) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    // 1. Update fields
    const fields = ['complaint', 'summary', 'doctorObservations', 'advice', 'followUp', 'doctorNotes'];
    fields.forEach(f => {
      if (data[f] !== undefined) consultation[f] = data[f];
    });

    consultation.status = 'COMPLETED';
    consultation.endedAt = new Date();
    await consultation.save();

    // 2. Mark appointment as completed
    await Appointment.findByIdAndUpdate(consultation.appointmentId, { status: 'COMPLETED' });

    // 3. Auto-generate Medical Record in database
    const medicalRecord = new MedicalRecord({
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      appointmentId: consultation.appointmentId,
      consultationId: consultation._id,
      recordDate: new Date(),
      complaint: consultation.complaint,
      consultationSummary: consultation.summary,
      observations: consultation.doctorObservations,
      advice: consultation.advice,
      followUp: consultation.followUp,
      attachments: data.attachments || [],
    });
    await medicalRecord.save();

    // 4. Notify patient with record ready alert
    const patient = await Patient.findById(consultation.patientId);
    if (patient) {
      await Notification.create({
        userId: patient.userId,
        type: 'CONSULTATION',
        title: '📋 Medical Record Ready',
        message: `Your consultation with Dr. ${doctor.fullName} is complete. Your prescription notes & medical summary are available now.`,
        relatedEntityType: 'consultation',
        relatedEntityId: consultation._id,
      });
    }

    return { consultation, medicalRecord };
  }

  /**
   * Get single consultation with authorization verification
   */
  async getConsultation(consultationId, userId, role) {
    const consultation = await Consultation.findById(consultationId)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId');

    if (!consultation) throw new Error('Consultation not found');

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || consultation.patientId._id.toString() !== patient._id.toString()) {
        const error = new Error('Unauthorized access');
        error.statusCode = 403;
        throw error;
      }
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor || consultation.doctorId._id.toString() !== doctor._id.toString()) {
        const error = new Error('Unauthorized access');
        error.statusCode = 403;
        throw error;
      }
    }

    return consultation;
  }
}

module.exports = new ConsultationService();
