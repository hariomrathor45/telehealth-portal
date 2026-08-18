const express = require('express');
const router = express.Router();
const priorityController = require('../controllers/priorityController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/assess', authorize('PATIENT', 'ADMIN'), priorityController.assessHealthConcern);
router.get('/:id', priorityController.getAssessmentDetails);

module.exports = router;
