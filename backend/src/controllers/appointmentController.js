const appointmentService = require('../services/appointmentService');

const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, startTime, healthConcernId, priorityAssessmentId, notes } = req.body;
    if (!doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and start time are required.' });
    }

    const appointment = await appointmentService.bookAppointment(req.user.id, {
      doctorId, appointmentDate, startTime, healthConcernId, priorityAssessmentId, notes,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { status, date, limit } = req.query;
    const appointments = await appointmentService.getAppointments(req.user.id, req.user.role, {
      status, date, limit,
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const appointment = await appointmentService.updateStatus(req.params.id, status, req.user.id, req.user.role, reason);
    res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
};
