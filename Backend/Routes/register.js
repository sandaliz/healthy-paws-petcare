// Routes/register.js
import express from "express";
const router = express.Router();

import {
  createRegister,
  getRegisters,
  getRegister,
  getRegistersByEmail,
  getLatestRegisterByEmail,
  updateRegister,
  deleteRegister,
} from "../Controllers/registerController.js";

import { registerValidationRules, validateRegister } from "../middleware/registerValidation.js";
// import { protect } from "../middleware/auth.js"; // ✅ Uncomment if you have JWT auth

// Registration Routes
// POST create register
// router.post("/", protect, registerValidationRules(), validateRegister, createRegister);
router.post("/", registerValidationRules(), validateRegister, createRegister); // if no auth yet

// GET all registers
router.get("/", getRegisters);

// GET latest by email
router.get("/user/:email/latest", getLatestRegisterByEmail);

// GET all registers by email
router.get("/user/:email", getRegistersByEmail);

// GET single register by id
router.get("/:id", getRegister);

// UPDATE register
router.put("/:id", registerValidationRules(), validateRegister, updateRegister);

// DELETE register
router.delete("/:id", deleteRegister);

export default router;