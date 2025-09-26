// Model/Shipping.js
import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },

  // user reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  // optional link to cart
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },

  items: [
    {
      productName: String,
      quantity: Number,
      cost: Number,
    },
  ],

  totalPrice: { type: Number, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Shipping = mongoose.model("Shipping", shippingSchema);
export default Shipping;