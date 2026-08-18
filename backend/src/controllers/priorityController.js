const priorityService = require('../services/priorityService');

const assessHealthConcern = async (req, res, next) => {
  try {
    const { mainConcern, symptoms, duration, severity, optionalInformation } = req.body;
    const result = await priorityService.assessHealthConcern(req.user.id, {
      mainConcern,
      symptoms,
      duration,
      severity,
      optionalInformation,
    });

    res.status(201).json({
      success: true,
      message: 'Priority calculation evaluated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAssessmentDetails = async (req, res, next) => {
  try {
    const assessment = await priorityService.getAssessmentDetails(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assessHealthConcern,
  getAssessmentDetails,
};
