const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const DoctorVerification = require('../models/DoctorVerification');
const AdminAuditLog = require('../models/AdminAuditLog');
const Notification = require('../models/Notification');

class AdminService {
  /**
   * Admin dashboard live statistics
   */
  async getDashboardStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      todayAppointments,
      completedConsultations,
      highPriorityActiveCount,
      priorityCounts
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ verificationStatus: 'PENDING' }),
      Doctor.countDocuments({ verificationStatus: 'APPROVED' }),
      Doctor.countDocuments({ verificationStatus: 'REJECTED' }),
      Appointment.countDocuments({ appointmentDate: { $gte: todayStart, $lte: todayEnd } }),
      Consultation.countDocuments({ status: 'COMPLETED' }),
      Appointment.countDocuments({
        status: { $in: ['REQUESTED', 'CONFIRMED', 'WAITING'] },
        priorityLevel: { $in: ['HIGH', 'VERY_HIGH'] },
      }),
      Appointment.aggregate([
        { $group: { _id: '$priorityLevel', count: { $sum: 1 } } }
      ])
    ]);

    const priorityBreakdown = { LOW: 0, MEDIUM: 0, HIGH: 0, VERY_HIGH: 0 };
    priorityCounts.forEach(p => {
      if (p._id) priorityBreakdown[p._id] = p.count;
    });

    return {
      totalPatients,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      todayAppointments,
      completedConsultations,
      highPriorityActiveCount,
      priorityBreakdown,
    };
  }

  /**
   * Get doctors with search and verification filters
   */
  async getDoctors({ status, search, page = 1, limit = 20 }) {
    const filter = {};
    if (status && status !== 'ALL') {
      filter.verificationStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { medicalRegistrationNumber: searchRegex },
        { qualification: searchRegex },
        { specialization: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate('userId', 'email status lastLoginAt')
        .sort({ createdAt: -1 })
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
   * Get full doctor verification record including submitted documents
   */
  async getDoctorDetails(doctorId) {
    const doctor = await Doctor.findById(doctorId).populate('userId', 'email status');
    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    const verification = await DoctorVerification.findOne({ doctorId }).sort({ createdAt: -1 });

    return { doctor, verification };
  }

  /**
   * Update individual document status in doctor verification
   */
  async updateDocumentStatus(doctorId, docIndex, status, adminId) {
    const verification = await DoctorVerification.findOne({ doctorId });
    if (!verification || !verification.submittedDocuments[docIndex]) {
      throw new Error('Verification record or document index not found');
    }

    verification.submittedDocuments[docIndex].documentStatus = status;
    await verification.save();

    return verification;
  }

  /**
   * Approve a doctor -> marks verification APPROVED and doctor ACTIVE
   */
  async approveDoctor(doctorId, adminId, remarks = 'Approved by administrator.') {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    doctor.verificationStatus = 'APPROVED';
    doctor.accountStatus = 'ACTIVE';
    doctor.verificationRemarks = remarks;
    doctor.approvedAt = new Date();
    await doctor.save();

    // Update or create verification entry
    await DoctorVerification.findOneAndUpdate(
      { doctorId: doctor._id },
      {
        overallStatus: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        remarks,
      },
      { upsert: true }
    );

    // Immutable audit log
    await AdminAuditLog.create({
      adminId,
      action: 'DOCTOR_APPROVED',
      targetType: 'doctor',
      targetId: doctor._id,
      remarks,
      metadata: {
        doctorName: doctor.fullName,
        medicalReg: doctor.medicalRegistrationNumber,
      },
    });

    // Notify doctor
    await Notification.create({
      userId: doctor.userId,
      type: 'VERIFICATION',
      title: '🎉 Doctor Profile Approved',
      message: 'Your medical credentials have been verified. You can now accept patient appointments and conduct consultations.',
      relatedEntityType: 'doctor',
      relatedEntityId: doctor._id,
    });

    return { success: true, doctor };
  }

  /**
   * Reject a doctor with mandatory reason
   */
  async rejectDoctor(doctorId, adminId, remarks) {
    if (!remarks || !remarks.trim()) {
      const error = new Error('A detailed reason for rejection is required.');
      error.statusCode = 400;
      throw error;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    doctor.verificationStatus = 'REJECTED';
    doctor.verificationRemarks = remarks;
    await doctor.save();

    await DoctorVerification.findOneAndUpdate(
      { doctorId: doctor._id },
      {
        overallStatus: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        remarks,
      },
      { upsert: true }
    );

    // Audit log
    await AdminAuditLog.create({
      adminId,
      action: 'DOCTOR_REJECTED',
      targetType: 'doctor',
      targetId: doctor._id,
      remarks,
      metadata: { doctorName: doctor.fullName },
    });

    // Notify doctor
    await Notification.create({
      userId: doctor.userId,
      type: 'VERIFICATION',
      title: '❌ Verification Not Approved',
      message: `Your verification could not be approved: ${remarks}. You may update your documents and resubmit.`,
      relatedEntityType: 'doctor',
      relatedEntityId: doctor._id,
    });

    return { success: true, doctor };
  }

  /**
   * Toggle doctor active/suspended status
   */
  async toggleDoctorStatus(doctorId, adminId, newStatus, remarks) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    doctor.accountStatus = newStatus;
    await doctor.save();

    await AdminAuditLog.create({
      adminId,
      action: newStatus === 'SUSPENDED' ? 'DOCTOR_SUSPENDED' : 'SETTINGS_UPDATED',
      targetType: 'doctor',
      targetId: doctor._id,
      remarks: remarks || `Doctor status changed to ${newStatus}`,
    });

    return doctor;
  }

  /**
   * List all patients for Admin with search
   */
  async getPatients({ search, page = 1, limit = 20 }) {
    const filter = {};
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('userId', 'email status createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Patient.countDocuments(filter),
    ]);

    return {
      patients,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Toggle patient account status
   */
  async togglePatientStatus(patientId, adminId, newStatus, remarks) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const user = await User.findById(patient.userId);
    if (!user) throw new Error('User account not found');

    user.status = newStatus;
    await user.save();

    await AdminAuditLog.create({
      adminId,
      action: newStatus === 'SUSPENDED' ? 'PATIENT_SUSPENDED' : 'PATIENT_REACTIVATED',
      targetType: 'patient',
      targetId: patient._id,
      remarks: remarks || `Patient status updated to ${newStatus}`,
    });

    return { patient, user };
  }

  /**
   * Get administrative audit logs
   */
  async getAuditLogs({ page = 1, limit = 25 }) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AdminAuditLog.find()
        .populate('adminId', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AdminAuditLog.countDocuments(),
    ]);

    return { logs, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Comprehensive analytics and distribution charts
   */
  async getAnalytics() {
    // 1. Priority distribution
    const priorityDistribution = await Appointment.aggregate([
      { $group: { _id: '$priorityLevel', count: { $sum: 1 } } }
    ]);

    // 2. Specialization distribution of approved doctors
    const specializationStats = await Doctor.aggregate([
      { $match: { verificationStatus: 'APPROVED' } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // 3. Appointment status breakdown
    const appointmentStatusStats = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return {
      priorityDistribution,
      specializationStats,
      appointmentStatusStats,
    };
  }
}

module.exports = new AdminService();
