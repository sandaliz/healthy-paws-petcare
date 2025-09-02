const Product = require("../Model/productModel");

// GET all
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ADD product
const addProducts = async (req, res) => {
  const { id, name, expirationDate, cost, currantStock, minimumThreshold, category, productStatus } = req.body;

  console.log("File received:", req.file);

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
    console.log(err);
    res.status(500).json({ message: "Unable to add" });
  }
};

// UPDATE product
const updateProducts = async (req, res) => {
  const productId = req.params.id;

  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = req.file.path; 
    }

    const updated = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    res.status(200).json({ product: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to update" });
  }
};

// DELETE product
const deleteProducts = async (req, res) => {
  const productId = req.params.id;
  try {
    const deleted = await Product.findByIdAndDelete(productId);
    res.status(200).json({ product: deleted });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to delete" });
  }
};

module.exports = { getAllProducts, addProducts, updateProducts, deleteProducts };