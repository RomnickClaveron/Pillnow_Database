const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationControllers');

router.post('/', medicationController.addMedication);
router.get('/', medicationController.getAllMedications);
router.get('/:id', medicationController.getMedicationById);
router.put('/:id', medicationController.updateMedicationById);
router.delete('/:id', medicationController.deleteMedicationById);

module.exports = router; 