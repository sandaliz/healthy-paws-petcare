import Loyalty from "../../Model/finance/loyaltyModel.js";
import User from "../../Model/userModel.js";

export const getAllLoyalty = async (req, res) => {
  try {
    const loyalties = await Loyalty.find().populate("userID", "name email");
    res.json({ loyalties });
  } catch (err) {
    console.error("getAllLoyalty error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addLoyaltyPoints = async (req, res) => {
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
    console.error("addLoyaltyPoints error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Manually update loyalty tier
export const updateLoyaltyTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    const loyalty = await Loyalty.findById(id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty record not found" });

    await loyalty.updateTier(tier);
    res.json({ message: "Tier updated manually", loyalty });
  } catch (err) {
    console.error("updateLoyaltyTier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a loyalty record
export const deleteLoyalty = async (req, res) => {
  try {
    const loyalty = await Loyalty.findByIdAndDelete(req.params.id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty record not found" });

    res.json({ message: "Loyalty record deleted", loyalty });
  } catch (err) {
    console.error("deleteLoyalty error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get or create loyalty for a specific user (pet owner)
export const getUserLoyalty = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID) {
      return res.status(400).json({ message: "userID required" });
    }

    let loyalty = await Loyalty.findOne({ userID });
    // if user never had loyalty record, create baseline
    if (!loyalty) {
      loyalty = await Loyalty.create({ userID, points: 0, tier: "Puppy Pal" });
    }

    res.json({ loyalty });
  } catch (err) {
    console.error("getUserLoyalty error:", err);
    res.status(500).json({ message: "Server error" });
  }
};