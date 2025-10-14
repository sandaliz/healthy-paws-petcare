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

import Register from "../Model/Register.js"; 
import { registerValidationRules, validateRegister } from "../middleware/registerValidation.js";

//graphs 
router.get("/stats/registrations", async (req, res) => {
  try {
    const { type = "daily" } = req.query;

    let groupBy;
    if (type === "monthly") {
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };//month
    } else if (type === "weekly") {
      groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } }; // Week
    } else {
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; // Daily
    }

    const stats = await Register.aggregate([
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// POST create register
router.post("/", registerValidationRules(), validateRegister, createRegister);

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