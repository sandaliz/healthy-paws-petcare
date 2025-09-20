const express = require("express");
const router = express.Router();
const prescriptionController = require("../Controllers/prescriptionController");

// ✅ Insights route for daily sales
router.get("/insights/daily-sales", prescriptionController.getDailySalesCounts);

// CRUD routes
router.get("/", prescriptionController.getAllPrescriptions);
router.get("/:id", prescriptionController.getPrescriptionById);
router.post("/", prescriptionController.createPrescription);
router.put("/:id", prescriptionController.updatePrescriptionStatus);
router.delete("/:id", prescriptionController.deletePrescription);

module.exports = router;