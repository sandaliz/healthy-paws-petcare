import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  updateAppointment,
  deleteAppointment,
} from "../Controllers/appointmentController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAppointment);

router.get("/", protect, getAllAppointments);

router.get("/my", protect, getMyAppointments);

router.put("/:id", protect, updateAppointment);

router.delete("/:id", protect, deleteAppointment);

export default router;
