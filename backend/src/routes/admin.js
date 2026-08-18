const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/doctors', adminController.getDoctors);
router.get('/doctors/:id', adminController.getDoctorDetails);
router.patch('/doctors/:id/document-status', adminController.updateDocumentStatus);
router.post('/doctors/:id/approve', adminController.approveDoctor);
router.post('/doctors/:id/reject', adminController.rejectDoctor);
router.patch('/doctors/:id/status', adminController.toggleDoctorStatus);

router.get('/patients', adminController.getPatients);
router.patch('/patients/:id/status', adminController.togglePatientStatus);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
