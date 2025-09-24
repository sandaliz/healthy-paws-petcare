import "dotenv/config.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import financeRoutes from "./Routes/finance/financeRoutes.js";
import Invoice from "./Model/finance/invoiceModel.js";

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "x-role"],
}));

app.use(express.json());

// Routes
app.use("/api/finance", financeRoutes);

// Health
app.get("/", (_, res) => res.send("Healthy Paws Finance API running"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Background jobs
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
  // Run hourly + once at boot
  setInterval(markOverdue, 60 * 60 * 1000);
  markOverdue();
}

// DB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itp_project";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
      startOverdueJob();
    });
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });
