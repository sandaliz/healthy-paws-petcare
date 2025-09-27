// Routes/CheckInOutRoutes.js (fixed)
import express from "express";
import * as CheckInOutController from "../Controllers/CheckInOutControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/checkin", protect, CheckInOutController.checkInPet);
router.put("/checkout/:id", protect, CheckInOutController.checkOutPet);
router.put("/reject/:id", protect, CheckInOutController.rejectAppointment);
router.put("/cancel/:id", protect, CheckInOutController.cancelAppointment);
router.get("/history", protect, CheckInOutController.getHistory);
router.get("/current", protect, CheckInOutController.getCurrentCheckedInPets);
router.delete("/history/empty", protect, CheckInOutController.deleteEmptyHistory);
router.delete("/history/:id", protect, CheckInOutController.deleteHistoryById);

export default router;