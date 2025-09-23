const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String, // 🔹 Temporary — later you can change to ObjectId when User model exists
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

module.exports = mongoose.model("Cart", cartSchema);