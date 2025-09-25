// Controllers/CareControllers.js (ESM)
import CareCustomer from "../Model/CareModel.js";
import Reminder from "../Model/ReminderModel.js"; 
import { scheduleReminder } from "../services/ReminderScheduler.js"; 

// Get all appointments (Admin only)
export const getAllDetails = async (req, res) => {
  try {
    const careCustomers = await CareCustomer.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    if (!careCustomers || careCustomers.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    return res.status(200).json({ careCustomers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Insert appointment for logged-in user
export const addDetails = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware

    const {
      ownerName,
      contactNumber,
      email,
      petName,
      species,
      healthDetails,
      dateStay,
      pickUpDate,
      nightsStay,
      dropOffTime,
      pickUpTime,
      foodType,
      feedingTimes,
      grooming,
      walking,
      emergencyAction,
      agree,
    } = req.body;

    const status = req.body.status || "Pending";

    const careCustomer = new CareCustomer({
      user: userId,
      ownerName,
      contactNumber,
      email,
      petName,
      species,
      healthDetails,
      dateStay,
      pickUpDate,
      nightsStay,
      dropOffTime,
      pickUpTime,
      foodType,
      feedingTimes,
      grooming,
      walking,
      emergencyAction,
      status,
      agree,
    });

    await careCustomer.save();

    // 🕐 Calculate reminder times safely
    const appointmentDate = new Date(dateStay);
    const reminderTimes = [
      { hoursBefore: 24, message: `Reminder: ${petName}'s stay starts in 24 hours (${appointmentDate.toLocaleString()})` },
      { hoursBefore: 3, message: `Reminder: ${petName}'s stay starts in 3 hours (${appointmentDate.toLocaleString()})` },
    ];

    for (const r of reminderTimes) {
      const remindAt = new Date(appointmentDate.getTime() - r.hoursBefore * 60 * 60 * 1000);
      if (remindAt > new Date()) { // only future reminders
        const reminder = new Reminder({
          user: userId,
          appointment: careCustomer._id,
          message: r.message,
          remindAt,
        });
        await reminder.save();
        scheduleReminder(reminder);
      }
    }

    return res.status(201).json({
      message: "Appointment created successfully & reminders scheduled",
      careCustomer,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: err.message });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Get appointment by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const careCustomer = await CareCustomer.findById(id).populate("user", "name email");

    if (!careCustomer) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (careCustomer.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update appointment
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    let careCustomer = await CareCustomer.findById(id);
    if (!careCustomer) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (careCustomer.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    careCustomer = await CareCustomer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ message: "Appointment updated successfully", careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete appointment
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const careCustomer = await CareCustomer.findById(id);
    if (!careCustomer) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (careCustomer.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await careCustomer.deleteOne();

    return res.status(200).json({ message: "Appointment deleted successfully", careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Approved", "Rejected", "Checked-In", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const careCustomer = await CareCustomer.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!careCustomer) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({ message: `Status updated to ${status}`, careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get by status
export const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const careCustomers = await CareCustomer.find({ status })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    if (!careCustomers || careCustomers.length === 0) {
      return res.status(404).json({ message: `No ${status} appointments found` });
    }

    return res.status(200).json({ careCustomers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
