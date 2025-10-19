// routes/ReminderRoutes.js
import express from "express";
import {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
  deleteReminder
} from "../Controllers/ReminderControllers.js";

const router = express.Router();

router.post("/", createReminder);
router.get("/", getAllReminders);
router.get("/:id", getReminderById);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
