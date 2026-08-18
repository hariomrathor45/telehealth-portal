const medicalRecordService = require('../services/medicalRecordService');

const getMyRecords = async (req, res, next) => {
  try {
    let records = [];
    if (req.user.role === 'PATIENT') {
      records = await medicalRecordService.getPatientRecords(req.user.id);
    } else if (req.user.role === 'DOCTOR') {
      records = await medicalRecordService.getDoctorAuthorizedRecords(req.user.id);
    }
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await medicalRecordService.getRecordById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRecords,
  getRecordById,
};
