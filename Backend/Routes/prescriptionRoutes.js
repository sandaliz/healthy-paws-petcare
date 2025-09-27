// Routes/prescriptionRoutes.js
import express from "express";
import * as prescriptionController from "../Controllers/prescriptionController.js";

const router = express.Router();

// ✅ Insights route for daily sales
router.get("/insights/daily-sales", prescriptionController.getDailySalesCounts);

// CRUD routes
router.get("/", prescriptionController.getAllPrescriptions);
router.get("/:id", prescriptionController.getPrescriptionById);
router.post("/", prescriptionController.createPrescription);
router.put("/:id", prescriptionController.updatePrescriptionStatus);
router.delete("/:id", prescriptionController.deletePrescription);
router.get("/appointment/:appointmentId", prescriptionController.getPrescriptionsByAppointment);

export default router;  // ✅ replaces module.exports