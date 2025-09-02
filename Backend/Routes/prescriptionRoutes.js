const express = require("express");
const router = express.Router();
const prescriptionController = require("../Controllers/prescriptionController");

// Get all prescriptions
router.get("/", prescriptionController.getAllPrescriptions);

// Get single prescription by ID
router.get("/:id", prescriptionController.getPrescriptionById);

// Create new prescription
router.post("/", prescriptionController.createPrescription);

// Update prescription status 
router.put("/:id", prescriptionController.updatePrescriptionStatus);

// Delete prescription 
router.delete("/:id", prescriptionController.deletePrescription);

module.exports = router;