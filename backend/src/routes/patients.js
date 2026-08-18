const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('PATIENT', 'ADMIN'));

router.get('/dashboard', patientController.getDashboard);
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

module.exports = router;
