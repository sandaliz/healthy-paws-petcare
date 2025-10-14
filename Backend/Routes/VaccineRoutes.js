// routes/VaccineRoutes.js
import express from "express";
import { createVaccinePlan, getUserVaccinePlans } from "../Controllers/VaccineController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Create a new vaccine plan (only logged-in users)
router.post("/", protect, createVaccinePlan);

// Get all vaccine plans for the logged-in user
router.get("/", protect, getUserVaccinePlans);

export default router;
