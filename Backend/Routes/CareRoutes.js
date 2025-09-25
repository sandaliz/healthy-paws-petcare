import express from "express";
import * as CareControllers from "../Controllers/CareControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in users can do anything
router.post("/", protect, CareControllers.addDetails);
router.put("/:id", protect, CareControllers.updateUser);
router.delete("/:id", protect, CareControllers.deleteUser);
router.get("/:id", protect, CareControllers.getById);

// Admin-only (check inside controller)
router.get("/", protect, CareControllers.getAllDetails);
router.put("/:id/status", protect, CareControllers.updateStatus);
router.get("/status/:status", protect, CareControllers.getByStatus);

export default router;