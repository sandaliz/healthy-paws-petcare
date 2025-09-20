const Product = require("../Model/productModel");
const Prescription = require("../Model/Prescription");

// =============================
// CRUD
// =============================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const addProducts = async (req, res) => {
  const { id, name, expirationDate, cost, currantStock, minimumThreshold, category, productStatus } = req.body;

  try {
    const product = new Product({
      id,
      name,
      expirationDate,
      cost,
      currantStock,
      minimumThreshold,
      category,
      productStatus,
      imageUrl: req.file ? req.file.path : ""
    });
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Unable to add" });
  }
};

const updateProducts = async (req, res) => {
  const productId = req.params.id;
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.imageUrl = req.file.path;
    const updated = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    res.status(200).json({ product: updated });
  } catch (err) {
    res.status(500).json({ message: "Unable to update" });
  }
};

const deleteProducts = async (req, res) => {
  const productId = req.params.id;
  try {
    const deleted = await Product.findByIdAndDelete(productId);
    res.status(200).json({ product: deleted });
  } catch (err) {
    res.status(500).json({ message: "Unable to delete" });
  }
};

// =============================
// Insights
// =============================

// Sales by category
const getSalesByCategory = async (req, res) => {
  try {
    const products = await Product.find({});
    const result = {};
    products.forEach((p) => {
      if (!result[p.category]) result[p.category] = 0;
      result[p.category] += p.totalSold || 0;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error fetching sales by category" });
  }
};

// Fastest moving items
const getFastestMoving = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ totalSold: -1 })
      .limit(5);
    res.json(products.map((p) => ({ name: p.name, sales: p.totalSold || 0 })));
  } catch (err) {
    res.status(500).json({ error: "Error fetching fastest moving items" });
  }
};

// ✅ Fixed Top Foods (all-time, includes PetStore + Prescriptions)
const getTopFoods = async (req, res) => {
  try {
    const foods = await Product.find({ category: { $regex: /^food$/i } }) // "Food", "food", "FOOD" etc
      .sort({ totalSold: -1 })
      .limit(5);

    res.json(foods.map((f) => ({
      name: f.name,
      sales: f.totalSold || 0
    })));
  } catch (err) {
    console.error("Error fetching top foods", err);
    res.status(500).json({ error: "Error fetching top foods" });
  }
};

// =============================
// Generate Stock Report
// =============================
const generateStockReport = async (req, res) => {
  try {
    const products = await Product.find({}).lean();

    const report = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      currantStock: p.currantStock,
      minimumThreshold: p.minimumThreshold,
      cost: p.cost,
      expirationDate: p.expirationDate?.toISOString().split("T")[0],
      status: p.productStatus,
      totalSold: p.totalSold || 0   // ✅ For calculating total sales & revenue
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating stock report", err);
    res.status(500).json({ error: "Failed to generate stock report" });
  }
};

module.exports = {
  // … keep your existing functions
  getAllProducts,
  addProducts,
  updateProducts,
  deleteProducts,
  getSalesByCategory,
  getFastestMoving,
  getTopFoods,
  generateStockReport   // ✅ export here
};