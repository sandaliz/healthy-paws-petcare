// Controllers/CheckInOutControllers.js (ESM)
import mongoose from "mongoose";
import CheckInOut from "../Model/CheckInOutModel.js";
import CareCustomer from "../Model/CareModel.js";


// Check in Pet
export const checkInPet = async (req, res) => {
  try {
    const { appointmentId, checkedInBy } = req.body;

    const appointment = await CareCustomer.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Only allow check-in if status is Approved
    if (appointment.status !== "Approved") {
      return res.status(400).json({ message: "Appointment is not approved for check-in" });
    }

    const checkInRecord = new CheckInOut({
      appointment: appointment._id,
      checkInTime: new Date(),
      checkedInBy,
    });

    await checkInRecord.save();

    appointment.status = "Checked-In";
    await appointment.save();

    return res.status(201).json({ message: "Pet checked in successfully", checkInRecord });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Check Out Pet
export const checkOutPet = async (req, res) => {
  try {
    const { id } = req.params;

    const checkInRecord = await CheckInOut.findById(id).populate("appointment");
    if (!checkInRecord) return res.status(404).json({ message: "Check-in record not found" });

    if (checkInRecord.checkOutTime) {
      return res.status(400).json({ message: "Pet already checked out" });
    }

    checkInRecord.checkOutTime = new Date();
    checkInRecord.checkedOutBy = "System"; // replace with req.user if auth is added
    await checkInRecord.save();

    const appointment = checkInRecord.appointment;
    appointment.status = "Completed";
    await appointment.save();

    return res.status(200).json({ message: "Pet checked out successfully", checkInRecord });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reject Appointment
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await CareCustomer.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Rejected";
    await appointment.save();

    return res.status(200).json({ message: "Appointment rejected", careCustomer: appointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await CareCustomer.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Cancelled";
    await appointment.save();

    const history = new CheckInOut({
      appointment: appointment._id,
      checkInTime: null,
      checkOutTime: null,
      checkedInBy: "System",
      checkedOutBy: "System",
    });
    await history.save();

    return res.status(200).json({ message: "Appointment cancelled", history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get History
export const getHistory = async (req, res) => {
  try {
    const history = await CheckInOut.find({
      $or: [{ checkOutTime: { $ne: null } }],
    })
      .populate("appointment")
      .sort({ createdAt: -1 });

    const rejectedAndCancelled = await CheckInOut.find({
      checkInTime: null,
      checkOutTime: null,
    })
      .populate("appointment")
      .sort({ createdAt: -1 });

    const fullHistory = [...history, ...rejectedAndCancelled];

    return res.status(200).json({ history: fullHistory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Currently Checked-In Pets
export const getCurrentCheckedInPets = async (req, res) => {
  try {
    const checkedInPets = await CheckInOut.find({ checkOutTime: null })
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({ checkedInPets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete empty history
export const deleteEmptyHistory = async (req, res) => {
  try {
    const result = await CheckInOut.deleteMany({ appointment: null });
    return res.json({
      message: "Deleted history records without appointment details",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting records", error: err.message });
  }
};

// Delete history by ID
export const deleteHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await CheckInOut.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.json({
      message: `Record with _id ${id} deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting record", error: err.message });
  }
};