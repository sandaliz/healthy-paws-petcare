// Controllers/checkoutController.js
import Product from "../Model/productModel.js";
import Prescription from "../Model/Prescription.js";
import Cart from "../Model/Cart.js";
import User from "../Model/userModel.js"; 

export const checkout = async (req, res) => {
  try {
    const { items, source = "petstore", userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // 🔍 Ensure user exists (prevent fake IDs)
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    let subtotal = 0;

    for (let item of items) {
      if (!item.productMongoId) {
        return res.status(400).json({ error: "productMongoId missing in item" });
      }

      let product;
      try {
        product = await Product.findById(item.productMongoId);
      } catch (idErr) {
        return res.status(400).json({ error: `Invalid product ID: ${item.productMongoId}` });
      }

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productName}` });
      }

      if (item.quantity > product.currantStock) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }

      // Decrement stock / increment sold
      await Product.findByIdAndUpdate(item.productMongoId, {
        $inc: { currantStock: -item.quantity, totalSold: item.quantity },
      });

      subtotal += item.quantity * item.cost;
    }

    // ✅ Optional: if prescriptions are meant to track all orders
    const prescription = new Prescription({ items, status: "paid" });
    await prescription.save();

    // ✅ Save Cart Record with real userId
    const cartRecord = new Cart({
      userId, // must be ObjectId of user
      items: items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        cost: i.cost,
      })),
      totalPrice: subtotal,
    });

    await cartRecord.save();

    res.status(200).json({
      message: "Checkout successful",
      orderId: prescription._id,
      cartId: cartRecord._id,
      userId: cartRecord.userId,
    });
  } catch (err) {
    console.error("🚨 Checkout error:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
};