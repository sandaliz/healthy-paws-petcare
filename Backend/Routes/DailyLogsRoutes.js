// Routes/DailyLogsRoutes.js (ESM version)
import express from "express";
import * as DailyLogsControllers from "../Controllers/DailyLogsControllers.js";

const router = express.Router();

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

export default router;