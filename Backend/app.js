// app.js (Backend)
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

import User from "./Model/userModel.js";
import bcrypt from "bcryptjs";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

// Routes Mount
app.get("/", (req, res) => res.send("Welcome to Pet Care Management API"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);       // 👈 includes /profile, /:id update
app.use("/api/feedback", feedbackRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
// ---------- Super Admin Auto-Creation ----------
const createSuperAdmin = async () => {
  try {
    const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env");
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
      console.log("Super Admin created successfully");
    } else {
      console.log("Super Admin already exists");
    }
  } catch (error) {
    console.error("Error creating Super Admin:", error.message);
  }
};

// Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI, { dbName: "test" })
  .then(async () => {
    console.log("Connected to MongoDB (Database: test)");
    await createSuperAdmin();
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));