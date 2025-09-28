import express from "express";
import { handleEmergencyAction, getEmergencyHistory } from "../Controllers/EmergencyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, handleEmergencyAction);
router.get("/history", protect, getEmergencyHistory);

export default router;
