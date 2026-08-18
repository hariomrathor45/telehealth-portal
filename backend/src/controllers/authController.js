const authService = require('../services/authService');

const registerPatient = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, gender, address, emergencyContact } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const result = await authService.registerPatient({
      email, password, fullName, phone, dateOfBirth, gender, address, emergencyContact,
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const registerDoctor = async (req, res, next) => {
  try {
    const {
      email, password, fullName, phone, dateOfBirth, gender, address,
      medicalRegistrationNumber, qualification, specialization,
      experienceYears, hospitalClinic, consultationFee, bio, submittedDocuments,
    } = req.body;

    if (!email || !password || !fullName || !medicalRegistrationNumber || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, full name, medical registration number, and qualification are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const result = await authService.registerDoctor({
      email, password, fullName, phone, dateOfBirth, gender, address,
      medicalRegistrationNumber, qualification, specialization,
      experienceYears, hospitalClinic, consultationFee, bio, submittedDocuments,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created and pending administrative verification.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const result = await authService.login({ email, password, expectedRole: role });

    res.json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const setupAdmin = async (req, res, next) => {
  try {
    const { email, password, setupKey, fullName } = req.body;
    if (!email || !password || !setupKey) {
      return res.status(400).json({ success: false, message: 'Email, password, and setup key are required.' });
    }

    const result = await authService.createAdmin({ email, password, setupKey, fullName });
    res.status(201).json({ success: true, message: 'Admin created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const getSpecializations = async (req, res, next) => {
  try {
    const data = await authService.getSpecializations();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  refreshToken,
  getMe,
  setupAdmin,
  getSpecializations,
};
