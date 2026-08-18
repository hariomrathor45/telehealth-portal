const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');

// Public listing of approved doctors
router.get('/approved', doctorController.getApprovedDoctors);
router.get('/:id', doctorController.getDoctorProfile);

// Authenticated Doctor only routes
router.get('/me/dashboard', authenticate, authorize('DOCTOR'), doctorController.getMyDashboard);
router.get('/me/queue', authenticate, authorize('DOCTOR'), doctorController.getDoctorQueue);
router.get('/me/patients', authenticate, authorize('DOCTOR'), doctorController.getMyPatients);
router.get('/me/availability', authenticate, authorize('DOCTOR'), doctorController.getAvailability);
router.put('/me/availability', authenticate, authorize('DOCTOR'), doctorController.updateAvailability);

module.exports = router;
