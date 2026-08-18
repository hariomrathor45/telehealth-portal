const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const PriorityAssessment = require('../models/PriorityAssessment');
const Notification = require('../models/Notification');

class AppointmentService {
  /**
   * Book an appointment with an approved doctor
   */
  async bookAppointment(userId, { doctorId, appointmentDate, startTime, healthConcernId, priorityAssessmentId, notes }) {
    // 1. Fetch patient
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      const error = new Error('Patient profile not found. Please complete your registration.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch doctor (must be APPROVED and ACTIVE)
    const doctor = await Doctor.findOne({
      _id: doctorId,
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
    });
    if (!doctor) {
      const error = new Error('Doctor is not available or not yet approved for appointments.');
      error.statusCode = 400;
      throw error;
    }

    const bookingDate = new Date(appointmentDate);
    bookingDate.setHours(0, 0, 0, 0);

    // 3. Double-booking conflict check
    const existingConflict = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate: bookingDate,
      startTime,
      status: { $nin: ['CANCELLED', 'COMPLETED'] },
    });

    if (existingConflict) {
      const error = new Error('This time slot is already booked. Please choose another available time.');
      error.statusCode = 409;
      throw error;
    }

    // 4. Inherit priority if assessment provided
    let priorityLevel = 'LOW';
    let priorityScore = 15;

    if (priorityAssessmentId) {
      const assessment = await PriorityAssessment.findById(priorityAssessmentId);
      if (assessment) {
        priorityLevel = assessment.priorityLevel;
        priorityScore = assessment.priorityScore;
      }
    }

    // 5. Create Appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: doctor._id,
      healthConcernId: healthConcernId || null,
      priorityAssessmentId: priorityAssessmentId || null,
      appointmentDate: bookingDate,
      startTime,
      priorityLevel,
      priorityScore,
      status: 'CONFIRMED', // Direct confirmation for modern telehealth flow
      queueEnteredAt: new Date(),
      notes: notes ? notes.trim() : null,
    });
    await appointment.save();

    // 6. Notify Doctor
    await Notification.create({
      userId: doctor.userId,
      type: 'APPOINTMENT',
      title: `📅 New Appointment (${priorityLevel} Priority)`,
      message: `Patient ${patient.fullName} booked a consultation for ${bookingDate.toLocaleDateString()} at ${startTime}.`,
      relatedEntityType: 'appointment',
      relatedEntityId: appointment._id,
    });

    // 7. Notify Patient
    await Notification.create({
      userId,
      type: 'APPOINTMENT',
      title: '✅ Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.fullName} on ${bookingDate.toLocaleDateString()} at ${startTime} has been confirmed.`,
      relatedEntityType: 'appointment',
      relatedEntityId: appointment._id,
    });

    return appointment;
  }

  /**
   * Get appointments for patient or doctor with filtering
   */
  async getAppointments(userId, role, { status, date, limit = 50 }) {
    const filter = {};

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient) return [];
      filter.patientId = patient._id;
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) return [];
      filter.doctorId = doctor._id;
    }
    // Admin gets all without role filter

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = { $gte: targetDate, $lt: nextDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName phone dateOfBirth gender emergencyContact')
      .populate('doctorId', 'fullName specialization qualification consultationFee hospitalClinic profilePhoto')
      .populate('healthConcernId')
      .populate('priorityAssessmentId')
      .sort({ appointmentDate: -1, startTime: 1 })
      .limit(Number(limit));

    return appointments;
  }

  /**
   * Get single appointment by ID with role-based access check
   */
  async getAppointmentById(appointmentId, userId, role) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('healthConcernId')
      .populate('priorityAssessmentId');

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Role-based access validation
    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
        const error = new Error('Unauthorized access to this appointment.');
        error.statusCode = 403;
        throw error;
      }
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
        const error = new Error('Unauthorized access to this appointment.');
        error.statusCode = 403;
        throw error;
      }
    }

    return appointment;
  }

  /**
   * Update appointment status (e.g. WAITING, IN_CONSULTATION, COMPLETED, CANCELLED)
   */
  async updateStatus(appointmentId, newStatus, userId, role, reason) {
    const appointment = await this.getAppointmentById(appointmentId, userId, role);

    const validStatuses = ['REQUESTED', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];
    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Invalid status: ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    appointment.status = newStatus;
    if (reason) {
      appointment.cancellationReason = reason;
    }
    if (newStatus === 'WAITING' && !appointment.queueEnteredAt) {
      appointment.queueEnteredAt = new Date();
    }

    await appointment.save();

    return appointment;
  }
}

module.exports = new AppointmentService();
