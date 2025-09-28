import express from "express";
import { handleEmergencyAction } from "../Controllers/EmergencyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, handleEmergencyAction);


export default router;
