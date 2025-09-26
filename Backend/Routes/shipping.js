// routes/shipping.js
import express from "express";
import Shipping from "../Model/Shipping.js";

const router = express.Router();

// save shipping details with order items
router.post("/", async (req, res) => {
  try {
    const { fullName, lastName, address, email, phone, userId, items, totalPrice } = req.body;

    const shipping = new Shipping({
      fullName,
      lastName,
      address,
      email,
      phone,
      userId: userId || "guest",
      items,
      totalPrice,
    });

    await shipping.save();
    res.status(201).json(shipping);
  } catch (err) {
    console.error("❌ Error saving shipping:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;