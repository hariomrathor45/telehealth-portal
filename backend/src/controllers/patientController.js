const patientService = require('../services/patientService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await patientService.getDashboardData(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await patientService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await patientService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
};
