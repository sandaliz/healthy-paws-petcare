// Routes/CheckInOutRoutes.js (ESM version)
import express from "express";
import * as CheckInOutController from "../Controllers/CheckInOutControllers.js";

const router = express.Router();

router.post("/checkin", CheckInOutController.checkInPet);
router.put("/checkout/:id", CheckInOutController.checkOutPet);
router.put("/reject/:id", CheckInOutController.rejectAppointment);
router.put("/cancel/:id", CheckInOutController.cancelAppointment);
router.get("/history", CheckInOutController.getHistory);
router.get("/current", CheckInOutController.getCurrentCheckedInPets);
router.delete("/history/empty", CheckInOutController.deleteEmptyHistory);
router.delete("/history/:id", CheckInOutController.deleteHistoryById);

export default router;