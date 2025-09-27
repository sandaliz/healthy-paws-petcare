// controllers/ReminderController.js
import Reminder from "../Model/ReminderModel.js";
import CareCustomer from "../Model/CareModel.js";
import { scheduleReminder } from "../services/ReminderScheduler.js"; // adjust path if needed

// Helper to format IST
function toIST(date) {
  return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

// ✅ Create Reminder
export const createReminder = async (req, res) => {
  try {
    const { careId, email, remindAt, message } = req.body;

    // 1️⃣ Validate appointment (CareCustomer)
    const care = await CareCustomer.findById(careId);
    if (!care) return res.status(404).json({ message: "Appointment not found" });

    // 2️⃣ Create reminder in DB
    const newReminder = new Reminder({
      care: care._id,
      email,
      remindAt,
      message,
    });
    await newReminder.save();

    // 3️⃣ Log creation timestamp (UTC + IST)
    const nowUTC = new Date();
    console.log(
      `🗓️ New reminder created -> ID: ${newReminder._id}, Email: ${email}, RemindAt: ${new Date(
        remindAt
      ).toISOString()} (UTC), ${toIST(new Date(remindAt))} (IST), CreatedAt: ${nowUTC.toISOString()} (UTC), ${toIST(
        nowUTC
      )} (IST)`
    );

    // 4️⃣ Schedule the reminder immediately
    scheduleReminder(newReminder);

    res.status(201).json({
      message: "Reminder created and scheduled",
      reminder: newReminder,
    });
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    res.status(400).json({ message: error.message });
  }
};
// ✅ Get All Reminders
export const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate("care", "ownerName petName dateStay dropOffTime pickUpDate");
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Reminder by ID
export const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate("care", "ownerName petName dateStay dropOffTime pickUpDate");

    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
