import express from "express";
import { 
  getProfile, 
  updateProfile, 
  assignRole 
} from "../Controllers/userController.js";   
import { 
  editUser, 
  createStaff, 
  getStaffUsers, 
  deleteStaffUser, 
  toggleStaffStatus 
} from "../controllers/authController.js";  
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------- Profile ----------
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

// ---------- Role management ----------
router.post("/assign-role", protect, authorizeRoles("SUPER_ADMIN"), assignRole);
router.put("/:userId", protect, authorizeRoles("SUPER_ADMIN"), editUser);

// ---------- Staff management ----------
router.post("/staff", protect, authorizeRoles("SUPER_ADMIN"), createStaff);
router.get("/staff", protect, authorizeRoles("SUPER_ADMIN"), getStaffUsers);
router.delete("/staff/:id", protect, authorizeRoles("SUPER_ADMIN"), deleteStaffUser);
router.put("/staff/:id/toggle", protect, authorizeRoles("SUPER_ADMIN"), toggleStaffStatus);

export default router;