const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public
router.post('/register/patient', authController.registerPatient);
router.post('/register/doctor', authController.registerDoctor);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/specializations', authController.getSpecializations);

// Setup
router.post('/setup-admin', authController.setupAdmin);

// Protected
router.get('/me', authenticate, authController.getMe);

module.exports = router;
