// services/ReminderScheduler.js
import cron from "node-cron";
import Reminder from "../Model/ReminderModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure Nodemailer with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: format IST
function toIST(date) {
  return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

// Retry wrapper
async function sendWithRetry(sendFn, retries = 3, delay = 2000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await sendFn();
    } catch (error) {
      attempt++;
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
}

// Send reminder immediately
async function sendReminderImmediately(reminder) {
  if (reminder.sent) return;

  // Ensure a message exists
  if (!reminder.message) {
    const petName = reminder.care?.petName || "your pet";
    reminder.message = `
      <html>
        <body>
          <p>Reminder: You have an upcoming appointment for ${petName}.</p>
        </body>
      </html>
    `;
    console.warn(`⚠️ Generated fallback message for Reminder ID: ${reminder._id}`);
  }

  try {
    await sendWithRetry(async () => {
      const info = await transporter.sendMail({
        from: `"Healthy Paws" <${process.env.SENDER_EMAIL}>`,
        to: reminder.email,
        subject: "Healthy Paws - Appointment Reminder",
        html: reminder.message, // ✅ pure HTML only
      });
      console.log(`✅ Email sent -> ID: ${reminder._id}, to: ${reminder.email}`);
    });

    reminder.sent = true;
    await reminder.save();
  } catch (err) {
    console.error(`❌ Failed to send Reminder ID: ${reminder._id}, Error: ${err.message}`);
  }
}

// Schedule a single reminder
export const scheduleReminder = (reminder) => {
  const remindDate = new Date(reminder.remindAt);
  const now = new Date();

  if (remindDate <= now) {
    // Send immediately if past
    sendReminderImmediately(reminder);
    return;
  }

  // Schedule future reminder
  cron.schedule(
    `${remindDate.getUTCMinutes()} ${remindDate.getUTCHours()} ${remindDate.getUTCDate()} ${remindDate.getUTCMonth() + 1} *`,
    () => sendReminderImmediately(reminder),
    { scheduled: true, timezone: "UTC" }
  );
};

// Load and schedule all pending reminders
export const scheduleReminderEmails = async () => {
  try {
    const reminders = await Reminder.find({ sent: false }).populate("care");
    if (reminders.length > 0) {
      console.log(`🔄 Scheduling ${reminders.length} pending reminders...`);
      reminders.forEach(scheduleReminder);
    } else {
      console.log("ℹ️ No pending reminders to schedule.");
    }
  } catch (err) {
    console.error("❌ Error loading pending reminders:", err.message);
  }
};
