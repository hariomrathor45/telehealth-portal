const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/start', authorize('DOCTOR', 'ADMIN'), consultationController.startConsultation);
router.patch('/:id/notes', authorize('DOCTOR', 'ADMIN'), consultationController.saveNotes);
router.post('/:id/complete', authorize('DOCTOR', 'ADMIN'), consultationController.completeConsultation);
router.get('/:id', consultationController.getConsultation);

module.exports = router;
