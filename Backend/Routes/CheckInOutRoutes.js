const express = require("express");
const router = express.Router();
const CheckInOutController = require("../Controllers/CheckInOutControllers");

router.post("/checkin", CheckInOutController.checkInPet);
router.put("/checkout/:id", CheckInOutController.checkOutPet);
router.put("/reject/:id", CheckInOutController.rejectAppointment);
router.put("/cancel/:id", CheckInOutController.cancelAppointment);
router.get("/history", CheckInOutController.getHistory);
router.get("/current", CheckInOutController.getCurrentCheckedInPets);
router.delete("/history/empty", CheckInOutController.deleteEmptyHistory);
router.delete("/history/:id", CheckInOutController.deleteHistoryById);

module.exports = router;
