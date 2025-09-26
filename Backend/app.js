// app.js (Backend Root, ESM)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

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

import careRoutes from "./Routes/CareRoutes.js";
import reviewRouter from "./Routes/ReviewsRoutes.js";
import dailyLogsRouter from "./Routes/DailyLogsRoutes.js";
import checkInOutRouter from "./Routes/CheckInOutRoutes.js";

import appoitnemntRoutes from "./Routes/appointmentRoutes.js";
import eventRoutes from "./Routes/eventRoutes.js";
import blogRoutes from "./Routes/blogRoutes.js";
import User from "./Model/userModel.js";
import bcrypt from "bcryptjs";
import questionRoutes from "./Routes/quesionRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

// -------------------- Middleware --------------------
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

// -------------------- Routes --------------------
app.get("/", (req, res) => res.send("Welcome to Pet Care Management API"));

// Core APIs
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Products / Checkout
app.use("/products", productRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.post("/send-prescription", sendPrescriptionEmail);
app.use("/checkout", checkoutRoutes);

// Extra APIs
app.use("/careCustomers", careRoutes);
app.use("/reviews", reviewRouter);
app.use("/dailyLogs", dailyLogsRouter);
app.use("/checkinout", checkInOutRouter);

//appointment APIs
app.use("/api/appointments", appoitnemntRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/questions", questionRoutes);
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
    app.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));
