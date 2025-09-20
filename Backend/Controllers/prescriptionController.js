const Prescription = require("../Model/Prescription");
const Product = require("../Model/productModel");

// =============================
// Create Prescription
// =============================
exports.createPrescription = async (req, res) => {
  try {
    const { items } = req.body;
    const prescriptionItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productMongoId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (item.quantity > product.currantStock) {
        return res.status(400).json({
          error: `Not enough stock for ${product.name}. Available: ${product.currantStock}`
        });
      }

      prescriptionItems.push({
        productMongoId: product._id,
        productName: product.name,
        quantity: item.quantity,
        cost: product.cost
      });
    }

    const newPrescription = new Prescription({
      items: prescriptionItems,
      status: "pending"
    });

    const saved = await newPrescription.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save prescription" });
  }
};

// =============================
// Get All Prescriptions
// =============================
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

// =============================
// Get By Id
// =============================
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: "Error fetching prescription" });
  }
};

// =============================
// Update Prescription Status
// =============================
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!prescription) return res.status(404).json({ error: "Prescription not found" });

    // If status is "paid", deduct stock & increment totalSold
    if (status === "paid") {
      for (let item of prescription.items) {
        await Product.findByIdAndUpdate(item.productMongoId, {
          $inc: { currantStock: -item.quantity, totalSold: item.quantity }
        });
      }
    }

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: "Failed to update prescription status" });
  }
};

// =============================
// Delete
// =============================
exports.deletePrescription = async (req, res) => {
  try {
    const removed = await Prescription.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Prescription not found" });
    res.json({ message: "Prescription deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete prescription" });
  }
};

// =============================
// Insights: Daily Sales (All Sources)
// =============================
exports.getDailySalesCounts = async (req, res) => {
  try {
    const data = await Prescription.aggregate([
      { $match: { status: "paid" } }, // only paid sales
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data.map(d => ({ date: d._id, count: d.count })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching daily sales" });
  }
};