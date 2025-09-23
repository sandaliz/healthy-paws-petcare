// Model/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String, // 🔹 Temporary — later can be ObjectId when User model exists
    default: "guest", // Placeholder until real user IDs come in
  },
  items: [
    {
      productName: String,
      quantity: Number,
      cost: Number,
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart; // ✅ replaces module.exports