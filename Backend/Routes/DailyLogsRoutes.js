const express = require("express");
const router = express.Router();
const DailyLogsControllers = require("../Controllers/DailyLogsControllers");

router.post("/", DailyLogsControllers.createDailyLog);
router.get("/", DailyLogsControllers.getAllDailyLogs);
router.get("/appointment/:appointmentId", DailyLogsControllers.getLogsByAppointment);
router.get("/:id", DailyLogsControllers.getDailyLogById);
router.put("/:id", DailyLogsControllers.updateDailyLog);
router.delete("/:id", DailyLogsControllers.deleteDailyLog);

// Get logs by date range
router.get("/date/range", DailyLogsControllers.getLogsByDateRange);

// Get today's logs
router.get("/date/today", DailyLogsControllers.getTodaysLogs);

module.exports = router;

