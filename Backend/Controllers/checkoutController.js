const Product = require("../Model/productModel");
const Prescription = require("../Model/Prescription");

// POST /checkout
exports.checkout = async (req, res) => {
  try {
    const { items, source = "petstore" } = req.body; 
    // items = [{ productMongoId, productName, quantity, cost }]

    for (let item of items) {
      const product = await Product.findById(item.productMongoId);

      if (!product) return res.status(404).json({ error: "Product not found" });
      if (item.quantity > product.currantStock) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }

      // Deduct stock + increment sales
      await Product.findByIdAndUpdate(item.productMongoId, {
        $inc: { currantStock: -item.quantity, totalSold: item.quantity },
      });
    }

    // Save it as a "paid prescription" (order record) for reporting
    const prescription = new Prescription({ items, status: "paid" });
    await prescription.save();

    res.status(200).json({ message: "Checkout successful", orderId: prescription._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
};