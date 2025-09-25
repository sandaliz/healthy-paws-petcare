// services/ReminderScheduler.js
import schedule from "node-schedule";
import nodemailer from "nodemailer";
import Reminder from "../Model/ReminderModel.js";
import CareCustomer from "../Model/CareModel.js";
import User from "../Model/userModel.js";

// ✅ Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📩 Send Email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Reminder email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

// ⏰ Schedule a single reminder safely
export const scheduleReminder = (reminder) => {
  if (!reminder) return; // guard against undefined
  if (reminder.sent) return; // already sent
  if (!reminder.remindAt || reminder.remindAt < new Date()) return; // past date

  schedule.scheduleJob(reminder._id.toString(), reminder.remindAt, async () => {
    try {
      const appointment = await CareCustomer.findById(reminder.appointment);
      const user = await User.findById(reminder.user);

      if (!appointment || !user) return;

      await sendEmail(
        appointment.email,
        "🐾 Appointment Reminder",
        reminder.message
      );

      reminder.sent = true;
      await reminder.save();
      console.log(`✅ Reminder sent for ${appointment.petName}`);
    } catch (err) {
      console.error("Error executing reminder:", err);
    }
  });

  console.log(`⏰ Reminder scheduled for ${reminder.remindAt}`);
};

// 🚀 Schedule all pending reminders at server start
export const scheduleReminderEmails = async () => {
  try {
    const reminders = await Reminder.find({ sent: false });
    reminders.forEach((reminder) => {
      if (reminder) scheduleReminder(reminder);
    });
    console.log(`✅ Loaded ${reminders.length} pending reminders`);
  } catch (err) {
    console.error("Error scheduling reminders:", err);
  }
};
