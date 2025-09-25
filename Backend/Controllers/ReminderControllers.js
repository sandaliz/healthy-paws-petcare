// controllers/ReminderController.js
import Reminder from "../Model/ReminderModel.js";
import User from "../Model/userModel.js";
import CareCustomer from "../Model/CareModel.js";

// Create Reminder
export const createReminder = async (req, res) => {
  try {
    const { user, appointment, type, date, message } = req.body;

    const newReminder = new Reminder({ user, appointment, type, date, message });
    await newReminder.save();

    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Reminders
export const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate("user", "name email")
      .populate("appointment", "ownerName petName dateStay pickUpDate");
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reminder by ID
export const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate("user", "name email")
      .populate("appointment", "ownerName petName dateStay pickUpDate");

    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
