const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const Specialization = require('../models/Specialization');
const AdminAuditLog = require('../models/AdminAuditLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const config = require('../config');

class AuthService {
  /**
   * Register a new patient
   */
  async registerPatient({ email, password, fullName, phone, dateOfBirth, gender, address, emergencyContact }) {
    // 1. Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Create User account
    const user = new User({
      email: email.toLowerCase().trim(),
      passwordHash: password, // Mongoose pre-save hook handles hashing
      role: 'PATIENT',
      status: 'ACTIVE',
    });
    await user.save();

    // 3. Create Patient Profile
    const patient = new Patient({
      userId: user._id,
      fullName: fullName.trim(),
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
    });
    await patient.save();

    // 4. Generate Tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
      refreshToken,
      profile: patient,
    };
  }

  /**
   * Register a new doctor (defaults to PENDING verification)
   */
  async registerDoctor({
    email, password, fullName, phone, dateOfBirth, gender, address,
    medicalRegistrationNumber, qualification, specialization,
    experienceYears, hospitalClinic, consultationFee, bio, submittedDocuments = []
  }) {
    // 1. Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Check duplicate medical registration number
    const existingDoctor = await Doctor.findOne({ medicalRegistrationNumber: medicalRegistrationNumber.trim() });
    if (existingDoctor) {
      const error = new Error('A doctor with this Medical Registration Number is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Create User account
    const user = new User({
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'DOCTOR',
      status: 'ACTIVE',
    });
    await user.save();

    // 4. Create Doctor Profile (PENDING by default)
    const doctor = new Doctor({
      userId: user._id,
      fullName: fullName.trim(),
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
      medicalRegistrationNumber: medicalRegistrationNumber.trim(),
      qualification: qualification.trim(),
      specialization: specialization ? specialization.trim() : null,
      experienceYears: Number(experienceYears) || 0,
      hospitalClinic: hospitalClinic || null,
      consultationFee: Number(consultationFee) || 0,
      bio: bio || null,
      verificationStatus: 'PENDING',
      accountStatus: 'ACTIVE',
    });
    await doctor.save();

    // 5. Create initial verification submission record
    const verification = new DoctorVerification({
      doctorId: doctor._id,
      submittedDocuments: submittedDocuments.map(doc => ({
        documentType: doc.documentType || 'other',
        storageKey: doc.storageKey || 'uploaded',
        originalName: doc.originalName || 'document',
        mimeType: doc.mimeType || 'application/pdf',
        documentStatus: 'PENDING',
      })),
      overallStatus: 'PENDING',
      remarks: 'Application submitted for administrative verification.',
    });
    await verification.save();

    // 6. Generate Tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
      refreshToken,
      profile: doctor,
      verificationStatus: 'PENDING',
    };
  }

  /**
   * User login with role verification and state checking
   */
  async login({ email, password, expectedRole }) {
    // 1. Fetch user including passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 2. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 3. Check account status
    if (user.status !== 'ACTIVE') {
      const error = new Error(`Your account is ${user.status.toLowerCase()}. Please contact portal support.`);
      error.statusCode = 403;
      throw error;
    }

    // 4. Role authorization check if role was selected on UI
    if (expectedRole && expectedRole !== user.role) {
      const error = new Error(`Account exists but does not match role: ${expectedRole}. You are registered as a ${user.role}.`);
      error.statusCode = 403;
      throw error;
    }

    // 5. Fetch associated profile & verification state
    let profile = null;
    let doctorVerificationStatus = null;

    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id });
      doctorVerificationStatus = profile?.verificationStatus || 'PENDING';
    }

    // 6. Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // 7. Tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const redirectPath = this.getRedirectPath(user.role);

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        doctorVerificationStatus,
      },
      token,
      refreshToken,
      profile,
      redirectPath,
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(tokenString) {
    if (!tokenString) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(tokenString);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token. Please login again.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'ACTIVE') {
      const error = new Error('User not found or inactive');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = generateAccessToken(user);
    return { token: newAccessToken };
  }

  /**
   * Get authenticated user's current profile
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile,
    };
  }

  /**
   * Admin creation endpoint (protected by master setup key)
   */
  async createAdmin({ email, password, setupKey, fullName = 'System Administrator' }) {
    if (setupKey !== config.adminSetupKey) {
      const error = new Error('Invalid administrative setup key.');
      error.statusCode = 403;
      throw error;
    }

    const existingAdmin = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const adminUser = new User({
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    await adminUser.save();

    // Log admin creation
    await AdminAuditLog.create({
      adminId: adminUser._id,
      action: 'ADMIN_CREATED',
      targetType: 'user',
      targetId: adminUser._id,
      remarks: `Admin account initialized: ${email}`,
    });

    const token = generateAccessToken(adminUser);
    const refreshToken = generateRefreshToken(adminUser);

    return {
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Get active specializations list
   */
  async getSpecializations() {
    return Specialization.find().sort({ name: 1 });
  }

  /**
   * Determine default dashboard path for role
   */
  getRedirectPath(role) {
    switch (role) {
      case 'PATIENT': return '/patient/dashboard';
      case 'DOCTOR': return '/doctor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  }
}

module.exports = new AuthService();
