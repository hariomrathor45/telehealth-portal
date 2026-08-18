const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', medicalRecordController.getMyRecords);
router.get('/:id', medicalRecordController.getRecordById);

module.exports = router;
