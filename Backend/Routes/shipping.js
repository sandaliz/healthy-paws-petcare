import express from "express";
import Shipping from "../Model/Shipping.js";

const router = express.Router();

// Save shipping details with order items
// Endpoint: POST /shipping
router.post("/", async (req, res) => {
  try {
    const { fullName, lastName, address, email, phone, userId, items, totalPrice } = req.body;

    const shipping = new Shipping({
      fullName,
      lastName,
      address,
      email,
      phone,
      userId: userId || null, // null if guest order
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

// Get ALL shipping logs
// Endpoint: GET /shipping
router.get("/", async (req, res) => {
  try {
    const shippings = await Shipping.find()
      //.populate("userId", "name email") // enable if you have User model
      //.populate("cartId");              // enable if you have Cart model
    res.json(shippings);
  } catch (err) {
    console.error("❌ Error fetching shipping logs:", err);
    res.status(500).json({ error: "Failed to fetch shipping logs" });
  }
});

// Get shipping logs for a specific user
// Endpoint: GET /shipping/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const shippingLogs = await Shipping.find({ userId })
      //.populate("userId", "name email")
      //.populate("cartId");

    if (!shippingLogs.length) {
      return res.status(404).json({ message: "No shipping records found for this user." });
    }

    res.json(shippingLogs);
  } catch (err) {
    console.error("❌ Error fetching user shipping logs:", err);
    res.status(500).json({ error: "Failed to fetch user shipping logs" });
  }
});

export default router;