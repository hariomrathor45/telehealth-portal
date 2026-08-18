const adminService = require('../services/adminService');

const getDashboardStats = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await adminService.getDoctors({
      status,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getDoctorDetails = async (req, res, next) => {
  try {
    const data = await adminService.getDoctorDetails(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    const { docIndex, status } = req.body;
    const data = await adminService.updateDocumentStatus(req.params.id, docIndex, status, req.user.id);
    res.json({ success: true, message: 'Document verification updated', data });
  } catch (error) {
    next(error);
  }
};

const approveDoctor = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const result = await adminService.approveDoctor(req.params.id, req.user.id, remarks);
    res.json({ success: true, message: 'Doctor approved and activated.', data: result });
  } catch (error) {
    next(error);
  }
};

const rejectDoctor = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const result = await adminService.rejectDoctor(req.params.id, req.user.id, remarks);
    res.json({ success: true, message: 'Doctor rejected with remarks.', data: result });
  } catch (error) {
    next(error);
  }
};

const toggleDoctorStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const result = await adminService.toggleDoctorStatus(req.params.id, req.user.id, status, remarks);
    res.json({ success: true, message: 'Doctor status updated.', data: result });
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await adminService.getPatients({
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const togglePatientStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const result = await adminService.togglePatientStatus(req.params.id, req.user.id, status, remarks);
    res.json({ success: true, message: 'Patient status updated.', data: result });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAuditLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 25,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDoctors,
  getDoctorDetails,
  updateDocumentStatus,
  approveDoctor,
  rejectDoctor,
  toggleDoctorStatus,
  getPatients,
  togglePatientStatus,
  getAuditLogs,
  getAnalytics,
};
