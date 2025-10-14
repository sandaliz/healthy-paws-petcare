import express from "express";
import {
  register,
  login,
  logout,
  sendNewVerifyOtp,
  newVerifyEmail,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  isAuthenticated,
} from "../Controllers/authcontroller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);   
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.get("/check-auth", protect, isAuthenticated);
router.post("/send-verify-otp", protect, sendNewVerifyOtp);
router.post("/verify-email", protect, newVerifyEmail);

export default router;