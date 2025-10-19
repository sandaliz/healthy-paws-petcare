import express from "express";
import { getAdminDashboardStats } from "../Controllers/dashboardController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js"; // ✅ fixed path

const router = express.Router();

// Protect so that only logged-in ADMIN or SUPER_ADMIN can access
router.get(
  "/admin-dashboard-stats",
  protect,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAdminDashboardStats
);

export default router;