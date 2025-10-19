// Controllers/prescriptionController.js
import Prescription from "../Model/Prescription.js";
import Product from "../Model/productModel.js";

// =============================
// Create Prescription
// =============================
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, ownerEmail, items } = req.body;

    if (!appointmentId || !ownerEmail || !items || items.length === 0) {
      return res.status(400).json({ error: "appointmentId, ownerEmail and at least one item are required" });
    }

    const prescriptionItems = [];

    // validate each product & stock
    for (let item of items) {
      const product = await Product.findById(item.productMongoId);

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productMongoId} not found` });
      }

      if (item.quantity > product.currantStock) {
        return res.status(400).json({
          error: `Not enough stock for ${product.name}. Available: ${product.currantStock}`,
        });
      }

      prescriptionItems.push({
        productMongoId: product._id,
        productName: product.name,
        quantity: item.quantity,
        cost: product.cost,
      });
    }

    const newPrescription = new Prescription({
      appointmentId,
      ownerEmail,
      items: prescriptionItems,
      status: "pending",
    });

    const saved = await newPrescription.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Failed to save prescription" });
  }
};

// =============================
// Get All Prescriptions
// =============================
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("appointmentId") // 👈 helps when frontend wants appointment info
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

// =============================
// Get Prescription By Id
// =============================
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate("appointmentId");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err) {
    console.error("Error fetching prescription by id:", err);
    res.status(500).json({ error: "Error fetching prescription" });
  }
};

// =============================
// Update Prescription Status
// =============================
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    prescription.status = status;
    await prescription.save();

    // If status is "paid", deduct stock & increment totalSold
    if (status === "paid") {
      for (let item of prescription.items) {
        await Product.findByIdAndUpdate(item.productMongoId, {
          $inc: { currantStock: -item.quantity, totalSold: item.quantity },
        });
      }
    }

    res.json(prescription);
  } catch (err) {
    console.error("Error updating prescription status:", err);
    res.status(500).json({ error: "Failed to update prescription status" });
  }
};

// =============================
// Delete Prescription
// =============================
export const deletePrescription = async (req, res) => {
  try {
    const removed = await Prescription.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json({ message: "Prescription deleted" });
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
};

// =============================
// Insights: Daily Sales (Paid Prescriptions)
// =============================
export const getDailySalesCounts = async (req, res) => {
  try {
    const data = await Prescription.aggregate([
      { $match: { status: "paid" } }, // only count paid prescriptions
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data.map((d) => ({ date: d._id, count: d.count })));
  } catch (err) {
    console.error("Error fetching daily sales:", err);
    res.status(500).json({ error: "Error fetching daily sales" });
  }
};
// =============================
// Get Prescriptions by AppointmentId
// =============================
export const getPrescriptionsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescriptions = await Prescription.find({ appointmentId })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions by appointment:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};