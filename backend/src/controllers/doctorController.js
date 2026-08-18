const doctorService = require('../services/doctorService');

const getApprovedDoctors = async (req, res, next) => {
  try {
    const { specialization, search, minExp, maxFee, page, limit } = req.query;
    const result = await doctorService.getApprovedDoctors({
      specialization,
      search,
      minExp,
      maxFee,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getDoctorProfile = async (req, res, next) => {
  try {
    const data = await doctorService.getDoctorProfile(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyDashboard = async (req, res, next) => {
  try {
    const data = await doctorService.getDoctorDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDoctorQueue = async (req, res, next) => {
  try {
    const data = await doctorService.getDoctorQueue(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyPatients = async (req, res, next) => {
  try {
    const data = await doctorService.getMyPatients(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const data = await doctorService.getAvailability(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { schedule } = req.body;
    const data = await doctorService.updateAvailability(req.user.id, schedule || []);
    res.json({ success: true, message: 'Availability updated successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedDoctors,
  getDoctorProfile,
  getMyDashboard,
  getDoctorQueue,
  getMyPatients,
  getAvailability,
  updateAvailability,
};
