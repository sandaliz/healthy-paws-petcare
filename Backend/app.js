import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import bcrypt from "bcryptjs";

import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import feedbackRoutes from "./Routes/feedback.js";
import registerRoutes from "./Routes/register.js";
import chatRoutes from "./Routes/chatRoutes.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";

import productRoutes from "./Routes/productRoutes.js";
import prescriptionRoutes from "./Routes/prescriptionRoutes.js";
import { sendPrescriptionEmail } from "./Controllers/emailController.js";
import checkoutRoutes from "./Routes/checkoutRoutes.js";
import shippingRoutes from "./Routes/shipping.js";

import careRoutes from "./Routes/CareRoutes.js";
import reviewRouter from "./Routes/ReviewsRoutes.js";
import dailyLogsRouter from "./Routes/DailyLogsRoutes.js";
import checkInOutRouter from "./Routes/CheckInOutRoutes.js";
import emergencyRoutes from "./Routes/EmergencyRoutes.js";
import reminderRoutes from "./Routes/ReminderRoutes.js";
import { scheduleReminder } from "./services/ReminderScheduler.js";

import appointmentRoutes from "./Routes/appointmentRoutes.js";
import eventRoutes from "./Routes/eventRoutes.js";
import questionRoutes from "./Routes/quesionRoutes.js";

// Finance & Billing Imports
import financeRoutes from "./Routes/finance/financeRoutes.js";
import Invoice from "./Model/finance/invoiceModel.js";

// User Model (for Super Admin)
import User from "./Model/userModel.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("Welcome to Pet Care Management API"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/products", productRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.post("/send-prescription", sendPrescriptionEmail);
app.use("/checkout", checkoutRoutes);
app.use("/shipping", shippingRoutes);

scheduleReminder();
app.use("/careCustomers", careRoutes);
app.use("/reviews", reviewRouter);
app.use("/dailyLogs", dailyLogsRouter);
app.use("/checkinout", checkInOutRouter);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/reminders", reminderRoutes);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/questions", questionRoutes);

// Finance API
app.use("/api/finance", financeRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// -------------------- Background Jobs (Finance/Billing) --------------------
function startOverdueJob() {
  const markOverdue = async () => {
    try {
      const now = new Date();
      const res = await Invoice.updateMany(
        { status: "Pending", dueDate: { $lt: now } },
        { $set: { status: "Overdue" } }
      );
      if (res.modifiedCount) {
        console.log(`Overdue marked: ${res.modifiedCount}`);
      }
    } catch (err) {
      console.error("Overdue job error:", err);
    }
  };
  setInterval(markOverdue, 60 * 60 * 1000);
  markOverdue();
}

// -------------------- Super Admin Auto-Creation --------------------
const createSuperAdmin = async () => {
  try {
    const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.error(
        "❌ Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env"
      );
      return;
    }

    const existingAdmin = await User.findOne({ role: "SUPER_ADMIN" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      const superAdmin = new User({
        name: "Super Admin",
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      });
      await superAdmin.save();
      console.log("✅ Super Admin created successfully");
    } else {
      console.log("ℹ️ Super Admin already exists");
    }
  } catch (error) {
    console.error("🚨 Error creating Super Admin:", error.message);
  }
};

// -------------------- DB Connection --------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itp_project", {
    dbName: "test",
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB (Database: test)");
    await createSuperAdmin();
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      startOverdueJob(); // Start finance background job
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));