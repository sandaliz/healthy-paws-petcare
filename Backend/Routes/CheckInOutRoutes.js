const express = require("express");
const router = express.Router();
const CheckInOutController = require("../Controllers/CheckInOutControllers");

router.post("/checkin", CheckInOutController.checkInPet);
router.put("/checkout/:id", CheckInOutController.checkOutPet);
router.get("/current", CheckInOutController.getCurrentCheckedInPets);
router.get("/appointment/:appointmentId", CheckInOutController.getRecordsByAppointment);
router.get("/:id", CheckInOutController.getCheckInOutById);
router.put("/:id", CheckInOutController.updateCheckInOutRecord);
router.delete("/:id", CheckInOutController.deleteCheckInOutRecord);
router.get("/", CheckInOutController.getAllCheckInOutRecords);

module.exports = router;
