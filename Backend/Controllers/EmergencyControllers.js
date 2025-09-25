// controllers/EmergencyControllers.js
import Emergency from "../Model/EmergencyModel.js";
import CareCustomer from "../Model/CareModel.js";
import User from "../Model/userModel.js";

// Create Emergency
export const createEmergency = async (req, res) => {
  try {
    const emergency = new Emergency(req.body);
    await emergency.save();
    res.status(201).json(emergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Emergencies
export const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate("pet")
      .populate("reportedBy", "name email")
      .populate("owner", "name email");
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Emergency by ID
export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate("pet")
      .populate("reportedBy", "name email")
      .populate("owner", "name email");

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }
    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Emergency
export const updateEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }
    res.json(emergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Emergency
export const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }
    res.json({ message: "Emergency deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
