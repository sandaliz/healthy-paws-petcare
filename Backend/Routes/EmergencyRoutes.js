import express from "express";
import { handleEmergencyAction, getEmergencyHistoryById } from "../Controllers/EmergencyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, handleEmergencyAction);
router.get("/history/:appointmentID", protect, getEmergencyHistoryById);

export default router;
