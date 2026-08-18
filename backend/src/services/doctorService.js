const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');

class DoctorService {
  /**
   * Search and list approved active doctors for patient booking
   */
  async getApprovedDoctors({ specialization, search, minExp, maxFee, page = 1, limit = 20 }) {
    const filter = {
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
    };

    if (specialization) {
      filter.specialization = new RegExp(`^${specialization}$`, 'i');
    }

    if (minExp) {
      filter.experienceYears = { $gte: Number(minExp) };
    }

    if (maxFee) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { qualification: searchRegex },
        { specialization: searchRegex },
        { hospitalClinic: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('-userId -__v')
        .sort({ experienceYears: -1, fullName: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Doctor.countDocuments(filter),
    ]);

    return {
      doctors,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get public profile of a single approved doctor
   */
  async getDoctorProfile(doctorId) {
    const doctor = await Doctor.findOne({
      _id: doctorId,
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
    }).select('-userId -__v');

    if (!doctor) {
      const error = new Error('Doctor not found or not currently available for appointments.');
      error.statusCode = 404;
      throw error;
    }

    const availability = await DoctorAvailability.find({ doctorId: doctor._id, isAvailable: true });
    return { doctor, availability };
  }

  /**
   * Get authenticated doctor's full dashboard state
   */
  async getDoctorDashboard(userId) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      const error = new Error('Doctor profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Compute live metrics
    const [
      todayAppointments,
      waitingPatients,
      highPriorityCount,
      completedToday,
      totalAppointments,
      recentQueue
    ] = await Promise.all([
      Appointment.countDocuments({
        doctorId: doctor._id,
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: 'WAITING',
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: { $in: ['REQUESTED', 'CONFIRMED', 'WAITING'] },
        priorityLevel: { $in: ['HIGH', 'VERY_HIGH'] },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: 'COMPLETED',
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Appointment.countDocuments({ doctorId: doctor._id }),
      // Top 5 urgent waiting patients
      Appointment.find({
        doctorId: doctor._id,
        status: { $in: ['WAITING', 'CONFIRMED'] },
      })
        .populate('patientId', 'fullName phone dateOfBirth gender')
        .populate('healthConcernId')
        .sort({ priorityScore: -1, queueEnteredAt: 1, appointmentDate: 1 })
        .limit(5)
    ]);

    return {
      profile: doctor,
      stats: {
        todayAppointments,
        waitingPatients,
        highPriorityCount,
        completedToday,
        totalAppointments,
      },
      recentQueue,
    };
  }

  /**
   * Priority queue for doctor — sorted by urgency (priority score) + fair waiting time
   */
  async getDoctorQueue(userId) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      const error = new Error('Doctor profile not found');
      error.statusCode = 404;
      throw error;
    }

    const queue = await Appointment.find({
      doctorId: doctor._id,
      status: { $in: ['WAITING', 'CONFIRMED', 'IN_CONSULTATION'] },
    })
      .populate('patientId', 'fullName phone dateOfBirth gender')
      .populate('healthConcernId')
      .populate('priorityAssessmentId')
      .sort({
        // In consultation first, then highest priority score, then oldest queue entry
        status: -1,
        priorityScore: -1,
        queueEnteredAt: 1,
        appointmentDate: 1,
      });

    return { queue, doctorId: doctor._id };
  }

  /**
   * Get unique patients who have consulted with this doctor
   */
  async getMyPatients(userId) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) throw new Error('Doctor profile not found');

    const appointmentPatientIds = await Appointment.distinct('patientId', { doctorId: doctor._id });
    const patients = await Patient.find({ _id: { $in: appointmentPatientIds } }).select('-__v');

    return patients;
  }

  /**
   * Get availability configuration
   */
  async getAvailability(userId) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) throw new Error('Doctor not found');

    const availability = await DoctorAvailability.find({ doctorId: doctor._id }).sort({ dayOfWeek: 1 });
    return availability;
  }

  /**
   * Save/update availability configuration
   */
  async updateAvailability(userId, scheduleList) {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) throw new Error('Doctor not found');

    // Replace existing with new schedule
    await DoctorAvailability.deleteMany({ doctorId: doctor._id });

    const newDocs = scheduleList.map(s => ({
      doctorId: doctor._id,
      dayOfWeek: Number(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      breaks: s.breaks || [],
      isAvailable: s.isAvailable !== false,
      timezone: s.timezone || 'Asia/Kolkata',
    }));

    const saved = await DoctorAvailability.insertMany(newDocs);
    return saved;
  }
}

module.exports = new DoctorService();
