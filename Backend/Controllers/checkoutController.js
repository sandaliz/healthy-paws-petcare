const Product = require("../Model/productModel");
const Prescription = require("../Model/Prescription");
const Cart = require("../Model/Cart");

exports.checkout = async (req, res) => {
  try {
    const { items, source = "petstore", userId } = req.body;

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

      await Product.findByIdAndUpdate(item.productMongoId, {
        $inc: { currantStock: -item.quantity, totalSold: item.quantity },
      });

      subtotal += item.quantity * item.cost;
    }

    // Save Prescription (existing reporting flow)
    const prescription = new Prescription({ items, status: "paid" });
    await prescription.save();

    // Save Cart Record
    const cartRecord = new Cart({
      userId: userId || "guest",
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