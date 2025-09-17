const Loyalty = require("../../Model/finance/loyaltyModel.js");
const Register = require("../../Model/registerModel");

const getAllLoyalty = async (req, res) => {
  try {
    const loyalties = await Loyalty.find().populate("userID", "OwnerName OwnerEmail");
    res.json({ loyalties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const addLoyaltyPoints = async (req, res) => {
  try {
    const { userID, amountSpent } = req.body;
    if (!userID || amountSpent == null) {
      return res.status(400).json({ message: "userID and amountSpent are required" });
    }

    let loyalty = await Loyalty.findOne({ userID });
    if (!loyalty) loyalty = new Loyalty({ userID });

    await loyalty.addPoints(amountSpent);
    res.json({ message: "Points added and tier updated automatically", loyalty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLoyaltyTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    const loyalty = await Loyalty.findById(id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty record not found" });

    await loyalty.updateTier(tier);
    res.json({ message: "Tier updated manually", loyalty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteLoyalty = async (req, res) => {
  try {
    const loyalty = await Loyalty.findByIdAndDelete(req.params.id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty record not found" });
    res.json({ message: "Loyalty record deleted", loyalty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllLoyalty, addLoyaltyPoints, updateLoyaltyTier, deleteLoyalty };