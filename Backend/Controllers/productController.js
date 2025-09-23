// Controllers/productController.js
import Product from "../Model/productModel.js";

// 🔹 Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Add new product
export const addProducts = async (req, res) => {
  try {
    const { id, name, expirationDate, cost, currantStock, minimumThreshold, category, productStatus } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const newProduct = new Product({
      id,
      name,
      expirationDate,
      cost,
      currantStock,
      minimumThreshold,
      category,
      productStatus,
      imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Update product
export const updateProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) updates.imageUrl = req.file.path;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Delete product
export const deleteProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Insights - Sales by Category
export const getSalesByCategory = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: "$category", totalSold: { $sum: "$totalSold" } } },
    ]);
    res.json(data);
  } catch (err) {
    console.error("Error in sales insights:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Insights - Fastest Moving Products
export const getFastestMoving = async (req, res) => {
  try {
    const data = await Product.find().sort({ totalSold: -1 }).limit(5);
    res.json(data);
  } catch (err) {
    console.error("Error in fast moving products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Insights - Top Food Products
export const getTopFoods = async (req, res) => {
  try {
    const data = await Product.find({ category: "Food" }).sort({ totalSold: -1 }).limit(5);
    res.json(data);
  } catch (err) {
    console.error("Error in top foods:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Insights - Stock Report (🔧 fixed)
export const generateStockReport = async (req, res) => {
  try {
    // Return more fields needed by frontend PDF
    const data = await Product.find().select("name category cost totalSold currantStock minimumThreshold");
    res.json(data);
  } catch (err) {
    console.error("Error in stock report:", err);
    res.status(500).json({ error: "Server error" });
  }
};