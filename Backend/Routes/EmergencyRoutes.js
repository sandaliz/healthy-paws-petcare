// routes/EmergencyRoutes.js
import express from "express";
import {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergency,
  deleteEmergency,
} from "../Controllers/EmergencyControllers.js";

const router = express.Router();

router.post("/", createEmergency);
router.get("/", getAllEmergencies);
router.get("/:id", getEmergencyById);
router.put("/:id", updateEmergency);
router.delete("/:id", deleteEmergency);

export default router;
