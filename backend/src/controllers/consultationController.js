const consultationService = require('../services/consultationService');

const startConsultation = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ success: false, message: 'Appointment ID is required' });

    const result = await consultationService.startConsultation(appointmentId, req.user.id);
    res.json({ success: true, message: 'Consultation session started', data: result });
  } catch (error) {
    next(error);
  }
};

const saveNotes = async (req, res, next) => {
  try {
    const result = await consultationService.saveConsultationNotes(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Consultation notes updated', data: result });
  } catch (error) {
    next(error);
  }
};

const completeConsultation = async (req, res, next) => {
  try {
    const result = await consultationService.completeConsultation(req.params.id, req.user.id, req.body);
    res.json({
      success: true,
      message: 'Consultation finalized and Medical Record generated.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getConsultation = async (req, res, next) => {
  try {
    const result = await consultationService.getConsultation(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startConsultation,
  saveNotes,
  completeConsultation,
  getConsultation,
};
